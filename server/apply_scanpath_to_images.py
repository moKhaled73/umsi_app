import os
import csv
import cv2
import pandas as pd

def apply_scanpath_to_images():

    # Define paths
    csv_path = 'outputs/generated/final_predicted_results.csv'
    images_path = 'inputs/'
    output_path = 'outputs/images/'

    # Create output directory if it doesn't exist
    os.makedirs(output_path, exist_ok=True)

    # Load the CSV data
    data = pd.read_csv(csv_path)

    # Process each image listed in the CSV file
    for img_name in data['image'].unique():
        # Load the corresponding image
        img_path = os.path.join(images_path, img_name)
        img = cv2.imread(img_path)

        if img is None:
            print(f"Image {img_name} not found in {images_path}. Skipping...")
            continue

        # Get image dimensions
        img_height, img_width = img.shape[:2]

        # Filter data for the current image
        img_data = data[data['image'] == img_name]

        # Get the coordinates
        points = img_data[['x', 'y']].values

        # Create a copy of the image to draw on (for opacity effect)
        overlay = img.copy()

        # Draw the path dynamically based on image size
        minSize = min(img_height, img_width) 
        path_thickness = 3  + int(0.0001 * minSize)

        for i in range(1, len(points)):
            start_point = (int(points[i-1][0]), int(points[i-1][1]))
            end_point = (int(points[i][0]), int(points[i][1]))
            cv2.line(overlay, start_point, end_point, (255, 0, 0), path_thickness)

        # Mark each point in blue with opacity 0.7
        for point in points:
            center = (int(point[0]), int(point[1]))
            cv2.circle(overlay, center, 2*path_thickness, (255, 0, 0), -1)  # Blue points

        # Apply the overlay with opacity
        alpha = 0.7
        img = cv2.addWeighted(overlay, alpha, img, 1 - alpha, 0)

        # Mark the start point in green
        start_point = (int(points[0][0]), int(points[0][1]))
        cv2.circle(img, start_point, 2*path_thickness, (0, 255, 0), -1)  # Green point

        # Mark the last point in red
        end_point = (int(points[-1][0]), int(points[-1][1]))
        cv2.circle(img, end_point, 2*path_thickness, (0, 0, 255), -1)  # Red point

        # Save the processed image
        output_img_path = os.path.join(output_path, img_name)
        cv2.imwrite(output_img_path, img)

    print("Scanpath visualization completed.")

