# Start Tensorflow Dev Container

We gaan een (tensorflow/tensorflow:latest-jupyter) docker container starten en hierin ontwikkelen in python met vscode op de lokale desktop.

Benodigd zijn vs code (met de extention: Visual Studio Code Dev Containers)

1. Open de folder "beeld" in vscode, rechts onderin verschijnt nu de melding:
 ![reopen](.images/reopen_in_container.png)

2. Kies "Reopen in Container"

vs code is nu gestart en verbonden met de docker container. 
De folder "/workspaces/vrolijkevrijdag012023/beeld/home" is gedeeld en gemount als docker volume, waardoor wijzigingen direct zowel in de host als de container zichtbaar zijn.

3. Je kunt beginnen met het lezen en uitvoeren van de jupiter notebooks in het mapje 'basics' om de basics van tensorflow te leren.

4. In de folder 'image_classification' is een voorbeeld van het classificeren van images met tensorflow uitgelegd. Het eindresultaat is een tensorflow model.

5. In de folder 'server' zit de code om een tensorflow model te hosten als web api.Lees de readme.md in deze folder voor verdere instructies.