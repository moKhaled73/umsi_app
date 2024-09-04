import os
import glob
import csv
import cv2

def generate_raw_predicted_results():
    """
    Generate a raw predicted results CSV file by reading the predicted scanpaths
    and corresponding images from the predict_outputs and processed_image folders
    respectively.
    """
    # Create outputs directory if it doesn't exist
    output_dir = './outputs/generated'
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Initialize paths
    csv_files = glob.glob('./outputs/predict/*.csv')
    img_files = glob.glob('./inputs/*g')
    output_file_path = os.path.join(output_dir, 'raw_predicted_results.csv')

    # Create and open the CSV file
    with open(output_file_path, 'w', newline='') as wfile:
        writer = csv.writer(wfile)
        writer.writerow(["image", "width", "height", "username", "x", "y", "timestamp"])
        username = 'test'

        # Process each CSV file
        for csv_file in csv_files:
            with open(csv_file, 'r') as file:
                reader = csv.reader(file)
                for row in reader:
                    if row[0] != 'x':
                        image_name = csv_file.split('\\')[-1][:-4] + '.png'
                        path = './inputs\\{}'.format(image_name)

                        # Check for alternative image extensions
                        if path not in img_files:
                            image_name = image_name[:-4] + '.jpg'
                            path = path[:-4] + '.jpg'
                        if path not in img_files:
                            image_name = image_name[:-4] + '.jpg'
                            path = path[:-4] + '.jpeg'
                        if path not in img_files:
                            print('ERROR: no image found')
                            exit()

                        # Read the image and get dimensions
                        image = cv2.imread(path)
                        width = image.shape[1]
                        height = image.shape[0]

                        # Write the data to the CSV file
                        writer.writerow([image_name, width, height, username, 
                                         float(row[0]) * width, 
                                         float(row[1]) * height, row[2]])
