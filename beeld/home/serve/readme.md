# Start serving the 'trooper-model' model as a web-api and test it

Following these 3 steps will give you:

A running docker container running a FastApi(python) web server (exposed to your desktop on port 80: [http://localhost:80/docs](http://localhost:80/docs)).

The webserver has 1 endpoint /predict/image that allows you to post a jpeg, the server response will be a json object telling you if this picture contains vader or a stromtrooper.

Important! Use (powershell) command prompt from the **'serve'** folder or you will build the wrong image!

1. build the image that will serve tf model: trooper-model

```
❯ docker build -t vx_tfserve:1.0 .
```

2. run the docker container using the image
```
❯ docker run -d -p 80:80 vx_tfserve:1.0
```

3. Now open [http://localhost:80/docs](http://localhost:80/docs) in your desktop browser.


# Create Train and Save the model.

The file './create-train-save-load.py' contains the script needed to re-create, re-train and re-save the 'trooper-model' which is allready saved in the 'trooper-model' folder. It references the ../image_classification/data_set where all the images are located to train the model. Of course it will only work inside an environment where tensorflow is installed.


# Developing the main.py and serve_model.py files

You could install and run the fastapi (webserver) in the same container as the container you just used to learn tensorflow (../basics and ../image_classification). This way you could easily troubleshoot and change the main.py code that is serving the model using FastApi to fit it to your needs.

Just start an interactive terminal from vs code into the 'serve' folder
root@118776e0c0fe:/workspaces/vrolijkevrijdag012023/beeld/home/serve#
and run:

```
pip install -r requirements.txt
```
to install the python packages needed to run the web server

You can then start the webserver on port 8000 with the following command:
```
uvicorn main:app --reload
```

Now if you make changes to main.py or serve_model.py the http server will automatically restart on http://localhost:8000/