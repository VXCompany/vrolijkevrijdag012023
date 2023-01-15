# Start serving tf model as a web-api and test it using the generated swagger endpoint http://localhost:80/docs

Important! Use (powershell) command prompt from the **'serve'** folder or you will build the wrong image!

* build the image that will serve tf model: trooper-model

```
❯ docker build -t vx_tfserve:1.0 .
```
* run the docker container using the image
```
❯ docker run -d -p 80:80 vx_tfserve:1.0
```


------------------
(optional): you could install and run the fastapi (webserver) in the same container as the container
you just used to learn tensorflow (basics and image_class..). This way you could easily trouble shoot the main.py code that is serving the model using FastApi

Just start an interactive docker terminal with the container from the serve folder:
root@118776e0c0fe:/workspaces/vrolijkevrijdag012023/beeld/home/serve#
and run:

```
pip install -r requirements.txt
```

```
uvicorn main:app --reload
```

Now if you make changes to main.py or serve_model.py the http server will automatically restart on http://localhost:8000/