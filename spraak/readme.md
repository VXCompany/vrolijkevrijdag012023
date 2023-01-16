# Wie staat daar voor de deur?
Zodra er aangebeld wordt moeten we er achter gaan komen wie er bij de deur staat en deze persoon op de juiste manier beantwoorden. Om dat te bereiken gaan we een drietal onderdelen bouwen.

- *Luisteren en spreken*: We maken een speech to text engine met azure cognitive services die de audio uit de deurbel omzet naar geschreven tekst en die de geschreven text omzet naar een audio bestand die we de deurbel kunnen laten afspelen.

- *Analyzeren*: We maken en trainen een language model en een chatbot die ons kan helpen te bepalen wie er voor de deur staat en welke vragen we moeten stellen.

## Speech engine
### Aanmaken azure resources

Benodigdheden:
- Azure subscription
- Azure CLI: https://learn.microsoft.com/en-us/cli/azure/

Open een terminal in **"\spraak\VX.PizzaDeliveryGuy.Speech\Deployment"** en voer onderstaande azure commando's uit.

```bash
az login 
az group create --name vxpizzadeliveryguyresources --location westeurope
az deployment group create --resource-group vxpizzadeliveryguyresources --template-file .\template.json --parameters .\parameters.json.json --parameters .\parameters.json

Please provide string value for 'resourceGroupName' (? for help): vxpizzadeliveryguyresources
Please provide string value for 'resourceGroupId' (? for help): [id beschikbaar in response van 'az group create']
```
Je hebt nu een Azure Cognitive Services resource aangemaakt die je kunt gebruiken voor het omzetten van tekst naar spraak of spraak naar tekst.

Om de service te kunnen gebruiken in code heb je een key nodig, deze kun je via de CLI opvragen met

```bash
az cognitiveservices account keys list --name vxpizzaguyspeechservice --resource-group vxpizzadeliveryguyresources

```
### Resources
Cognitive service documentatie: https://learn.microsoft.com/nl-NL/azure/cognitive-services/speech-service/ <br />
Mp3 to WAV: https://www.nuget.org/packages/NAudio, https://github.com/naudio/NAudio/blob/master/Docs/ConvertMp3ToWav.md

## Chatbot 
### Benodigheden Visual Studio of VSCode
Volg de instructie op https://learn.microsoft.com/nl-nl/azure/bot-service/bot-service-quickstart-create-bot?view=azure-bot-service-4.0&tabs=csharp%2Cvs voor het maken van een basis chatbot.

Download en installeer de bot framework emulator om je bot lokaal te testen: https://github.com/Microsoft/BotFramework-Emulator/releases/tag/v4.14.1

### Trainen bot
De bot die je hebt gemaakt met dit template doet niks anders dan echo'en wat jij tegen hem zegt. Om de bot slimmer te maken kun je je eigen code schrijven die reageert op de input.

### Deploy je bot naar Azure
Open een terminal in "\spraak\VX.PizzaDeliveryGuy.ChatBot\VX.PizzaDeliveryGuy.ChatBot\DeploymentTemplates\DeployUseExistResourceGroup\"

```bash
az login
az identity create --resource-group vxpizzadeliveryguyresources --name vxpizzadeliveryguyidentity
```
bewaar de waardes in name en clientid, die zijn nodig voor de volgende stap.

#### Aanmaken app service:

Open "\spraak\VX.PizzaDeliveryGuy.ChatBot\VX.PizzaDeliveryGuy.ChatBot\DeploymentTemplates\DeployUseExistResourceGroup\parameters-for-template-BotApp-with-rg.json" en pas de volgende velden aan.

- tenantId: clientid van de eerder aangemaakt identy.


```bash
az deployment group create --resource-group vxpizzadeliveryguyresources --template-file .\template-BotApp-with-rg.json --parameters .\parameters-for-template-BotApp-with-rg.jsoners-for-template-BotApp-with-rg.json

```
#### Aanmaken bot 

Open en pas de volgende velden aan.

- azureBotId: unieke naam (bijv. vxpizzadeliveryguybot + groepsnaam)    
- appId: clientid van de eerder aangemaakt identy.

```bash
az deployment group create --resource-group vxpizzadeliveryguyresources --template-file .\template-AzureBot-with-rg.json --parameters .\parameters-for-template-AzureBot-with-rg.jsons-for-template-AzureBot-with-rg.json
```

Ga naar de rootfolder van je project:

```bash
az bot prepare-deploy --lang Csharp --code-dir "." --proj-file-path "<my-cs-proj>"
```

ZIP de volledige inhoud van de root folder.

```bash
az webapp deployment source config-zip --resource-group vxpizzadeliveryguyresources --name vxpizzadeliveryguybotservice --src .\vxpizzadeliveryguybot.zipce --src .\vxpizzadeliveryguybot.zip
```
<mark>
LET OP: ga naar de configuration van app service in het azure portal en ga naar general settings. Controleer of **stack** op .NET staat en .NET version op .NET 7
</mark>

## Een gesprek starten met de bot

Uiteraard is het de bedoeling om de bot te laten reageren op wat de persoon aan de deur zegt tegen de deurbel.

Het resultaat van de speech-to-text service moet daarom naar de bot gestuurd worden. En het antwoord van de bot moet via de text-to-speech service weer naar de RING deurbel worden gestuurd.

Om een conversatie met de bot te voeren kun je gebruik maken van de direct line API.

Authenticate: https://learn.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication?view=azure-bot-service-4.0 <br>
Start een conversatie: https://learn.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-start-conversation?view=azure-bot-service-4.0 <br>
Stuur een bericht: https://learn.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-send-activity?view=azure-bot-service-4.0 <br>
Ontvang een bericht: https://learn.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-receive-activities?view=azure-bot-service-4.0 <br>

Voor inspiratie en een werkend voorbeeld in .NET kun je spieken in de repo folder /spraak/VX.PizzaDeliveryGuy.Speech/VX.PizzaDeliveryGuy.Speech/. 
