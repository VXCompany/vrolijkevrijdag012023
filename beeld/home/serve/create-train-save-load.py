import matplotlib.pyplot as plt
import numpy as np
import PIL
import tensorflow as tf

from tensorflow import keras
from keras import layers
from keras.models import Sequential

# Setup image folder
import pathlib

data_dir = pathlib.Path('../image_classification/data_set')

# Create a dataset, 
# the images will be resized automatically using the image_dataset_from_directory() utility
batch_size = 5
img_height = 180
img_width = 180

train_ds = tf.keras.utils.image_dataset_from_directory(
  data_dir,
  validation_split=0.2,
  subset="training",
  seed=123,
  image_size=(img_height, img_width),
  batch_size=batch_size)

val_ds = tf.keras.utils.image_dataset_from_directory(
  data_dir,
  validation_split=0.2,
  subset="validation",
  seed=123,
  image_size=(img_height, img_width),
  batch_size=batch_size)

class_names = train_ds.class_names

print('class names:', class_names) # class names: ['darth_vader', 'storm_trooper']
num_classes = len(class_names)

model = Sequential([
  # you could define the definitions of an input layer here but you don't have to
  layers.Rescaling(1./255, input_shape=(img_height, img_width, 3)),
  layers.Conv2D(16, 3, padding='same', activation='relu'), # 16 different '3x3 filters' result in 16 different features being recognized.
  layers.MaxPooling2D(),
  layers.Conv2D(32, 3, padding='same', activation='relu'),
  layers.MaxPooling2D(),
  layers.Conv2D(64, 3, padding='same', activation='relu'),
  layers.MaxPooling2D(),
  layers.Flatten(), #flattens from an 2d array of [180, 180] to 1d array [32400]
  layers.Dense(128, activation='relu'), # 128 = number of neurons in a network layer, that decide if an image matches
  layers.Dense(num_classes) # the last 2 Dense layers will transform the features into output labels
])

model.compile(
  optimizer='adam',
  loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True), #Computes how often integer targets are in the top K predictions.
  metrics=['accuracy']) #monitor accuracy after each training epoch

epochs = 10
history = model.fit(
  train_ds,
  validation_data=val_ds,
  epochs=epochs
)

model_location = 'trooper-model'
model.save(model_location)

# check if the saved model can be loaded again :)
new_model = tf.keras.models.load_model(model_location)
new_model.summary()

