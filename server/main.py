import os
import io
import sys
import time
import json
import glob
import cv2
import torch
import pickle
import open_clip
import numpy as np
import pandas as pd
import tensorflow as tf
import matplotlib.pyplot as plt
from PIL import Image, ImageOps
from sentence_transformers import util
from skimage import metrics


from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

import google.generativeai as genai

from predict_csv import predict_and_save
from generate_predicted_results import generate_raw_predicted_results
from subsample_seq import subsample_seq
from apply_scanpath_to_images import apply_scanpath_to_images
from utils import delete_all_files_in_folder

dataset_path = "./uicrit/uicrit_public.csv"
images_folder_path = "./uicrit/filtered_unique_uis/filtered_unique_uis"
encoded_path = './uicrit/encoded_images.pkl'
core_path = './uicrit/'

sys.path.append(core_path)

# Now you can import your modules
from core.functions import *
from core.entities import *
from core.similarity_model import *

df = pd.read_csv(dataset_path)
data, data_dict = createUICritData(df)


# Load the model when the script is initialized
heatmap3s_weights = 'models/umsi-3s.h5'
heatmap7s_weights = 'models/umsi-7s.h5'
heatmap3s_model = tf.keras.models.load_model(heatmap3s_weights)
heatmap7s_model = tf.keras.models.load_model(heatmap7s_weights)



def extract_json_response(response: str) -> list:
    start_flag = "START_JSON_RESPONSE"
    end_flag = "END_JSON_RESPONSE"

    try:
        # Extract text between flags
        json_text = response.split(start_flag)[1].split(end_flag)[0].strip()

        # Remove ````json` if present
        json_text = json_text.replace("```json", "").replace("```", "").strip()

        # Finding the beginning and end of the JSON
        json_start = min(json_text.find("{"), json_text.find("["))
        json_end = max(json_text.rfind("}"), json_text.rfind("]"))

        # Trim text to get JSON only
        clean_json = json_text[json_start:json_end + 1]

        return clean_json

    except (IndexError, json.JSONDecodeError) as e:
        print("Error extracting JSON:", e)
        return '[]'

def getResponse(input_image, few_shot_images, few_shot_tasks, guidelines):
    # Dynamically generate task descriptions from few_shot_tasks
    tasks_description = ""
    for i, task in enumerate(few_shot_tasks):
        tasks_description += f"tasks for image {i + 1}: {task}. "

    prompt = (
        f"The input image is the first image, followed by few-shot images. "
        f"Analyze the style of the {tasks_description} "
        f"Using this style and following the {guidelines}, generate new recommendations that fit the input image (the first image) in the same format, but are specific to the input image. "
        "For each recommendation, provide an accurate bounding box in the format [x1, y1, x2, y2] that matches the area of the image the recommendation refers to. "
        "Ensure that the bounding box is accurate and aligned with the described issue in the image. "
        "Do not repeat any comment or recommendation that has already been suggested earlier in this response. "
         "Return the response enclosed within special flags: START_JSON_RESPONSE and END_JSON_RESPONSE without any additional text or comments."
    )

    # Generate response using the model
    response = model.generate_content([prompt] + few_shot_images + [ input_image])

    # Extract and print the text part of the response
    response_text = response._result.candidates[0].content.parts[0].text
    return response_text

def get_few_shot(visiual_similarities_df, num_few_shot):
    few_shot_images = []
    for i in range(num_few_shot):
        img = Image.open(os.path.join(images_folder_path, visiual_similarities_df.iloc[i, 0]))
        few_shot_images.append(img)
        
    few_shot_tasks = []
    for i in range(num_few_shot):
        rico_id = visiual_similarities_df.iloc[i, 0].split('.')[0]
        task = json.dumps([t.to_json() for t in data_dict[int(rico_id)].tasks])
        few_shot_tasks.append(task)
    
    few_shot_comments = []  # List to store the comments for each few-shot image
    for i in range(num_few_shot):
        # Get the rico_id from the visual similarities DataFrame
        rico_id = visiual_similarities_df.iloc[i, 0].split('.')[0]
        
        # Get the tasks for the corresponding rico_id from the data_dict
        tasks = data_dict[int(rico_id)].tasks
        
        # Prepare a list to store all comments for the tasks
        comments_dict = []
        
        # Loop through each task to collect its comments
        for task in tasks:
            for comment in task.comments:
                comments_dict.append(comment.to_json())  # Use to_json() method if available
        
        # Encode the entire list of comments to JSON format
        comment_json = json.dumps(comments_dict)
        
        # Append the JSON-encoded comments to the few_shot_comments list
        few_shot_comments.append(comment_json)

    return few_shot_images, few_shot_tasks, few_shot_comments

def padding(img, shape_r, shape_c, channels=3):
    img_padded = np.zeros((shape_r, shape_c, channels), dtype=np.uint8)
    if channels == 1:
        img_padded = np.zeros((shape_r, shape_c), dtype=np.uint8)

    original_shape = img.shape
    rows_rate = original_shape[0]/shape_r
    cols_rate = original_shape[1]/shape_c

    if rows_rate > cols_rate:
        new_cols = (original_shape[1] * shape_r) // original_shape[0]
        img = cv2.resize(img, (new_cols, shape_r))
        if new_cols > shape_c:
            new_cols = shape_c
        img_padded[:, ((img_padded.shape[1] - new_cols) // 2):((img_padded.shape[1] - new_cols) // 2 + new_cols)] = img
    else:
        new_rows = (original_shape[0] * shape_c) // original_shape[1]
        img = cv2.resize(img, (shape_c, new_rows))
        if new_rows > shape_r:
            new_rows = shape_r
        img_padded[((img_padded.shape[0] - new_rows) // 2):((img_padded.shape[0] - new_rows) // 2 + new_rows), :] = img

    return img_padded

def preprocess_image(image) :
    img = np.array(image)
    preprocessed_img = np.zeros((1, 256, 256, 3))
    padded_image = padding(img, 256, 256, 3)
    preprocessed_img[0] = padded_image

    preprocessed_img[:, :, :, 0] -= 103.939
    preprocessed_img[:, :, :, 1] -= 116.779
    preprocessed_img[:, :, :, 2] -= 123.68

    return preprocessed_img

def resize_image_with_aspect_ratio(image, target_size=512):
    # Get the current dimensions of the image
    height, width = image.shape[:2]
    
    # Check if width is greater than height
    if width > height:
        # Calculate the new height keeping the aspect ratio
        new_width = target_size
        new_height = int((target_size / width) * height)
    else:
        # Calculate the new width keeping the aspect ratio
        new_height = target_size
        new_width = int((target_size / height) * width)
    
    # Resize the image
    resized_image = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
    
    return resized_image

def apply_colormap_to_heatmap(heatmap):
    heatmap = np.maximum(heatmap, 0)  # Ensure all values are positive
    heatmap /= heatmap.max()  # Normalize between 0 and 1
    heatmap = np.uint8(255 * heatmap)  # Scale to [0, 255]
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    return heatmap

def crop_image_to_dimension(image, target_value, dim='width'):
    height, width = image.shape[:2]
    
    if dim == 'width':
        # If the target value is greater than the current width, no cropping is done
        if target_value >= width:
            return image
        
        # Calculate how much to crop from each side
        crop_amount = (width - target_value) // 2
        
        # Crop the image by keeping the center and removing equally from left and right
        cropped_image = image[:, crop_amount:width-crop_amount]
    
    elif dim == 'height':
        # If the target value is greater than the current height, no cropping is done
        if target_value >= height:
            return image
        
        # Calculate how much to crop from the top and bottom
        crop_amount = (height - target_value) // 2
        
        # Crop the image by keeping the center and removing equally from top and bottom
        cropped_image = image[crop_amount:height-crop_amount, :]
    
    return cropped_image

def resize_heatmap_to_original_image(heatmap, original_image):
    img = np.array(original_image)
    img = resize_image_with_aspect_ratio(img)
    height, width,c = img.shape
    if(width > height):
        return crop_image_to_dimension(heatmap, height, "height")
    elif(height > width):
        return crop_image_to_dimension(heatmap, width, "width")


app = FastAPI()

# fastapi middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],  # Allows the specified origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

genai.configure(api_key="AIzaSyCsnFKo_eNQC_FXS6ImzO_2pjXPlF5XlhY")
model = genai.GenerativeModel("gemini-1.5-flash")

# heatmap 3s route
@app.post("/heatmap3s/upload")
async def upload_image(file: UploadFile = File(...)):
    
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes))

    if image.mode != 'RGB':
        image = image.convert('RGB')

    # image preprocessing
    preprocessed_img = preprocess_image(image)

    # Step 4: Predict using the model 3s
    predicited_heatmap = heatmap3s_model.predict(preprocessed_img)[0][0]

    # Step 4: Resize the preds_map to match the original image size
    resized_heatmap = resize_heatmap_to_original_image(predicited_heatmap, image)

    # Step 5: Normalize and apply colormap to the heatmap
    colored_heatmap = apply_colormap_to_heatmap(resized_heatmap)

    
    # Step 6: Convert the result to bytes and return it
    _, img_encoded = cv2.imencode('.png', colored_heatmap)
    img_bytes = io.BytesIO(img_encoded.tobytes())
    
    return StreamingResponse(img_bytes, media_type="image/png")


# heatmap 7s route
@app.post("/heatmap7s/upload")
async def upload_image(file: UploadFile = File(...)):
    
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes))

    if image.mode != 'RGB':
        image = image.convert('RGB')

    # image preprocessing
    preprocessed_img = preprocess_image(image)

    # Step 4: Predict using the model 3s
    predicited_heatmap = heatmap7s_model.predict(preprocessed_img)[0][0]

    # Step 4: Resize the preds_map to match the original image size
    resized_heatmap = resize_heatmap_to_original_image(predicited_heatmap, image)

    # Step 5: Normalize and apply colormap to the heatmap
    colored_heatmap = apply_colormap_to_heatmap(resized_heatmap)

    
    # Step 6: Convert the result to bytes and return it
    _, img_encoded = cv2.imencode('.png', colored_heatmap)
    img_bytes = io.BytesIO(img_encoded.tobytes())
    
    return StreamingResponse(img_bytes, media_type="image/png")

# scanpath route
@app.post("/scanpath/upload")
async def upload_image(file: UploadFile = File(...)):
    
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes))
    image = np.array(image)
    # Convert RGB to BGR (since OpenCV uses BGR format)
    image_bgr = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    cv2.imwrite("./inputs/img.png", image_bgr)

    reduced = True
    img_path = './inputs/'
    out_path = './outputs/predict/'
    predict_and_save(img_path, out_path, reduced)
    generate_raw_predicted_results()
    subsample_seq()
    apply_scanpath_to_images()

    scanpath_image = cv2.imread("./outputs/images/img.png")

    _, img_encoded = cv2.imencode('.png', scanpath_image)
    img_bytes = io.BytesIO(img_encoded.tobytes())

    return StreamingResponse(img_bytes, media_type="image/png")


# generate ui recommendations
@app.post("/generate_ui_recommendations")
async def generate_ui_recommendations(image: UploadFile = File(...), prompt: str = Form(...)):
    try:
        image_content = await image.read()

        # Convert binary data to a PIL Image
        image_pil = Image.open(io.BytesIO(image_content))

        # Convert the PIL Image to a NumPy array (buffer array)
        image_array = np.array(image_pil)

        prompt = "Provide UI recommendations to enhance this design based on the following prompt:" + prompt

        response = model.generate_content([prompt, image_pil])
        return {"recommendations": response.text}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/our_recommendations")
async def our_recommendations(image: UploadFile = File(...), guideline: str = Form(...)):
    
    image_content = await image.read()

    # Convert binary data to a PIL Image
    image_pil = Image.open(io.BytesIO(image_content))

    # Convert the PIL Image to a NumPy array (buffer array)
    image_array = np.array(image_pil)

    visiual_similarities_df = getSimilarImages(images_folder_path, image_array , encoded_path)

    few_shot_images, few_shot_tasks, few_shot_comments =  get_few_shot(visiual_similarities_df, 2)

    response = getResponse(image_pil, few_shot_images, few_shot_comments , guideline)
    response_json = json.loads(extract_json_response(response))
    comments_from_json = [Comment.from_json(comment) for comment in response_json]
    return {"recommendations": comments_from_json}