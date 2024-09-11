import os
from predict_csv import predict_and_save
from generate_predicted_results import generate_raw_predicted_results
from subsample_seq import subsample_seq
from apply_scanpath_to_images import apply_scanpath_to_images
from utils import delete_all_files_in_folder


if __name__ == "__main__":
    # Set this to False if you trained the model to output 4 features for each fixation: x, y, t, duration
    reduced = True

    img_path = './inputs/'
    out_path = './outputs/predict/'

    if not os.path.exists(out_path):
        os.makedirs(out_path)
    else:
        delete_all_files_in_folder("./outputs/predict")

    print('\n\n###########################')
    predict_and_save(img_path, out_path, reduced)
    print('\n\n###########################')

    generate_raw_predicted_results()

    subsample_seq()

    apply_scanpath_to_images()

    delete_all_files_in_folder("./inputs")

