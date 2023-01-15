# De ring API

Je hebt de sources gevonden van de Ring API.

Om de deurbel aan te kunnen sturen maken we gebruik van de volgende library: [https://github.com/dgreif/ring](https://github.com/dgreif/ring)

Omdat niet iedereen altijd alles in typescript wil doen, staat in deze map een API. Die kun je draaien door de docker image te builden en vervolgens te runnen. Dat doe je zo:

# API opstarten
Eerst haal je een ___**refresh_token**___ op met je Ring account en wachtwoord:
```powershell
curl https://oauth.ring.com/oauth/token -X POST  -H 'Content-Type: application/x-www-form-urlencoded' -d 'grant_type=password&username=*****&password=*****&client_id=RingWindows&scope=client'
```

Navigeer met je terminal naar de map waar package.json staat en build je de docker container:
```powershell
docker build -t ringapi:1.0 .
```

Run de docker container:
```powershell
docker run -d -p 8080:80 --name ringapi -e 'refreshtoken=**********' ringapi:1.0
```

# Deze API gebruiken

Met deze API kun je een aantal dingen doen. 

## Camera-overzicht ophalen:
Alle deurbellen en beveiligingscamera's die je hebt kun je weergeven via de API. Het Id van deze camera's heb je nodig om de andere endpoints van deze API aan te kunnen roepen. De lijst weergeven doe je zo:

```powershell
curl -X GET http://localhost:8080/cameras
```

Een antwoord ziet er zo uit:
```JSON
[{
    "id":124092831,
    "name":"Voordeur",
    "kind":"cocoa_doorbell"
}]
```

## Een actuele gebeurtenissen-lijst ophalen:
Hier heb je het Id van de camera voor nodig. Die vind je bij het /cameras endpoint:

```powershell
curl -X GET http://localhost:8080/cameras/124092831/history
```

Een response van dat endpoint ziet er als volgt uit:
```JSON
[
    {
    "id":7186324359030504000,
    "kind":"on_demand",
    "created_at":"2023-01-08T16:48:46Z"
},{
    "id":7186324144353211000,
    "kind":"on_demand",
    "created_at":"2023-01-08T16:47:56Z"
},
...
]
```
## Een video van een actuele gebeurtenis ophalen:
Hier heb je het Id van de gebeurtenis en het id van de camera voor nodig. Die vind je bij het /cameras/{cameraid}/history/{historyid} endpoint. Dit endpoint geeft je een zipfile.

De zipfile bevat:

* De opname als mp4 videobestand
* Een screenshot van elke halve seconde van het filmpje
* een mp3 geluidsopname

```powershell
curl -X GET http://localhost:8080/cameras/124092831/history/7186324359030504000 > result.zip
```


## Video opnemen
Je kunt ook on-demand video opnemen van de deurbel. Dat doe je met het /cameras/{id}/livestream endpoint. Dit endpoint geeft je een zipfile.

De zipfile bevat:

* De opname als mp4 videobestand
* Een screenshot van elke halve seconde van het filmpje
* een mp3 geluidsopname

Je kunt aangeven hoeveel seconden je wilt opnemen door de `/livestream?seconds=...` querystringparameter te gebruiken.

Concreet werkt het dus zo:
```powershell
curl -X GET 'http://localhost:8080/cameras/124092831/livestream?seconds=2' > result.zip
```

## Audio afspelen
Je kunt het livestream endpoint ook gebruiken om audio te streamen.

___**Audio moet in mp4 format zijn!!! Anders werkt het niet.**___

Audio afspelen doe je zo:
```powershell
curl -F file=@hallo.mp4 -H "Content-Type: multipart/form-data" http://localhost:8080/cameras/124092831/livestream 
```

Bovenstaand is hetzelfde als dat je in de volgende HTML pagina op submit zou drukken:

```html
<!DOCTYPE html>
<html>
    <body>
        <form method='post' action='http://localhost:8080/cameras/124092831/livestream' enctype="multipart/form-data">
            <input type='file' name='file'>
            <input type='submit'>
        </form>
    </body>
</html>
```

