# Wie staat daar voor de deur?
Zodra er aangebeld wordt moeten we er achter gaan komen wie er bij de deur staat en deze persoon op de juiste manier beantwoorden. Om dat te bereiken gaan we een drietal onderdelen bouwen.

- *Luisteren*: We maken een speech to text engine met azure cognitive services die de audio uit de deurbel omzet naar geschreven tekst.

- *Spreken*: We maken een text to speech engine met azure cognitive services die de text uit het language model omzet naar een audio bestand die we de deurbel kunnen laten afspelen.

- *Analyzeren*: We maken en trainen een language model en een chatbot die ons kan helpen te bepalen wie er voor de deur staat en welke vragen we moeten stellen.

#Speech engine
## Aanmaken azure resources

- Azure subscription
- Azure CLI: https://learn.microsoft.com/en-us/cli/azure/

Open een terminal in spraak\src\PizzaDeliveryGuy.Speech\VX.PizzaDeliveryGuy.Speech\Deployment en voer onderstaande azure commando's uit.

```
az login 
az group create --name vxpizzadeliveryguyresources --location westeurope
az deployment group create --resource-group vxpizzadeliveryguyresources --template-file .\template.json --parameters .\parameters.json.json --parameters .\parameters.json

Please provide string value for 'resourceGroupName' (? for help): vxpizzadeliveryguyresources
Please provide string value for 'resourceGroupId' (? for help): [id beschikbaar in response van 'az group create']
```
Je hebt nu een Azure Cognitive Services resource aangemaakt die je kunt gebruiken voor het omzetten van tekst naar spraak of spraak naar tekst.

Om de service te kunnen gebruiken in code heb je een key nodig, deze kun je via de CLI opvragen met

```
az cognitiveservices account keys list --name vxpizzaguyspeechservice --resource-group vxpizzadeliveryguyresources

```
## Resources
Cognitive service documentatie: https://learn.microsoft.com/nl-NL/azure/cognitive-services/speech-service/
Mp3 to WAV: https://www.nuget.org/packages/NAudio, https://github.com/naudio/NAudio/blob/master/Docs/ConvertMp3ToWav.md