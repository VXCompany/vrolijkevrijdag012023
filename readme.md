# Vrolijke Vrijdag 20 Januari

In deze repo vindt je alles wat je nodig hebt voor de VX Kennisdag van 20 januari 2023.

Deze kennisdag staat in het teken van IoT en Machine Learning. Je gaat:

* Een Ring deurbel aansturen met je computer. Daarover hier meer: ([readme.md](https://github.com/VXCompany/vrolijkevrijdag012023/tree/main/deurbel))
* De pizza-bezorger herkennen met AI. Daarover hier meer: ([readme.md](https://github.com/VXCompany/vrolijkevrijdag012023/tree/main/beeld))
* De deurbel laten praten met de bezorger. Daarover hier meer: ([readme.md](https://github.com/VXCompany/vrolijkevrijdag012023/tree/main/spraak))

## Getting started (deel 1 van de workshop)

Het is niet het doel van deze workshop dat je leert hoe je een deurbel aanstuurt. De focus ligt op het Machine Learning gedeelte. Daarom vind je hier de code hoe je eenvoudig een antwoordapparaat maakt van je ring-deurbel.

### Zo maak je een antwoordapparaat met powershell:

```powershell
# Voor ieder team draait er al een instance van de API waarmee je de deurbel aanstuurt.
# Daar hoef je dus niks meer voor te doen. De code van die API vindt je in de map 'Deurbel'
# in deze repository. Mocht je deze track dus later doen, dan kun je eventueel zelf een 
# instance van de API opstarten. 
#
# Op de homepagina van de API, in dit geval dus (https://vrolijkevrijdag1.hupseflups.westeurope
# .azurecontainerapps.io/) vindt je de documentatie van de API. Lees die door.
$historyEndpoint = 'https://vrolijkevrijdag1.hupseflups.westeurope.azurecontainerapps.io/cameras/1234567890/history'
$livestreamEndpoint = 'https://vrolijkevrijdag1.rhupseflups.westeurope.azurecontainerapps.io/cameras/1234567890/livestream'

# Je kunt eenvoudig de laatste gebeurtenissen bij de bel ophalen door een GET te doen op 
# het history endpoint:
curl -s $historyEndpoint > current.txt

$counter = 0
Write-Host Polling... $counter

# Je kunt gerust in een while/true loop het history endpoint pollen. Daar is dat endpoint
# voor gemaakt.
while ($counter -le 100)
{
    # nog een GET op het history endpoint
    curl -s $historyEndpoint > latest.txt

    $current = Get-Content current.txt
    $latest = Get-Content latest.txt

    # Als ten opzichte van de vorige call iets verandert is gebeurt er blijkbaar iets bij 
    # de deurbel... Daar kun je iets mee doen!
    if ($current -ne $latest) {
        Write-Host Answering...
        curl -s $historyEndpoint > current.txt
        Start-Sleep -Seconds 10
        
        # Zeg 'Hallo' tegen whoever er voor de deurbel staat
        curl -F file=@hallo.mp4 -H "Content-Type: multipart/form-data" $livestreamEndpoint
        Start-Sleep -Seconds 5
        
        # Todo: Kijk even of het een "Ding" event is.
        
        # Neem zijn/haar reactie op en download het resultaat naar een zipfile
        curl -s $livestreamEndpoint > dump.zip
    }

    Write-Host Polling... $counter
    $counter++
}                               
```

## Image classification (deel 2 en 3 van de workshop)

In de map ['Beeld'](https://github.com/VXCompany/vrolijkevrijdag012023/tree/main/beeld) vind je allerlei materiaal over beeldherkenning. Beeldherkenning doen we in deze workshop met Tensorflow. Doorloop de [basics](https://github.com/VXCompany/vrolijkevrijdag012023/tree/main/beeld/home/basics) en ga daarna door naar de info over [image classification](https://github.com/VXCompany/vrolijkevrijdag012023/blob/main/beeld/home/image_classification/learn.ipynb).

Weten hoe het allemaal werkt? Ga dan naar de workshop van Ferdi!

Neem [hier](https://github.com/VXCompany/vrolijkevrijdag012023/tree/main/beeld/home/serve) ook eens een kijkje. *hint *hint...

## Speech to text en vice versa (deel 2 en 3 van de workshop)
In de map ['Spraak'](https://github.com/VXCompany/vrolijkevrijdag012023/tree/main/spraak) vind je materiaal over spraak naar tekst en andersom. Dat doen we met Azure Cognitive Services en met Azure Bot. Doorloop de [readme](https://github.com/VXCompany/vrolijkevrijdag012023/tree/main/spraak) om dat aan de praat te krijgen.

Weten hoe dat allemaal werkt? Ga naar de workshop van Eelco!
