# Inhoud

- [Wie staat daar voor de deur?](#section1)
- [Azure resource groups](#section2)
- [Luisteren en praten](#section3)
- [Azure chatbot](#section4)
- [OPTIONEEL: Azure resources aanmaken](#section5)


# <a name="section1"></a> Wie staat daar voor de deur?
Zodra er aangebeld wordt moeten we er achter gaan komen wie er bij de deur staat en deze persoon op de juiste manier beantwoorden. Om dat te bereiken gaan we een aantal onderdelen bouwen.

- *Luisteren*: We maken een speech to text engine met azure cognitive services die de audio uit de deurbel omzet naar geschreven tekst zodat je je code een antwoord kan laten geven.

- *Praten*: We maken een  text to speech engine die het antwoord dat gegeven moet worden omzet naar  een audiofile die naar de deurbel gestuurd kan worden.

- *Azure Chatbot*: We maken een chatbot die ons kan helpen te bepalen wie er voor de deur staat en welke vragen we moeten stellen. 

- *Custom Question Answering*: Als we er aan toe komen maken en trainen we een language model die door de chatbot gebruikt kan worden om de juiste vragen te stellen o.b.v. de input vanuit de speech-to-text service.

# <a name="section2"></a> Azure resource groups
Voor elk team zijn er de resources die we nodig hebben voor de complete solution aangemaakt zodat deze meteen gebruikt kunnen worden.

- Team 1: https://portal.azure.com/#@vxcompany.com/resource/subscriptions/39740059-f78d-4d22-8dd6-8f2dffb4a915/resourceGroups/VrolijkTeam1/overview
- Team 2: https://portal.azure.com/#@vxcompany.com/resource/subscriptions/39740059-f78d-4d22-8dd6-8f2dffb4a915/resourceGroups/VrolijkTeam2/overview
- Team 3: https://portal.azure.com/#@vxcompany.com/resource/subscriptions/39740059-f78d-4d22-8dd6-8f2dffb4a915/resourceGroups/VrolijkTeam3/overview

De volgende resources zijn aangemaakt om te gaan gebruiken:

- Cognitive services (https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/)
Voor speech-to-text en text-to-speech.

- Azure Bot (https://learn.microsoft.com/en-us/azure/bot-service/bot-service-overview?WT.mc_id=Portal-Microsoft_Azure_BotService&view=azure-bot-service-4.0)
Voor het ontwikkelen en hosten van de chatbot

- Language Service (https://learn.microsoft.com/en-us/azure/cognitive-services/language-service/question-answering/overview)
Voor het kunnen trainen en samenstellen van een "question answering model".

Als je deze handleiding volgt na de vrolijke vrijdag kun je zelf de resources aanmaken door de stappen in [Azure resources aanmaken](#section6) te volgen.

# <a name="section3"></a> Luisteren en praten
De bedoeling is dat we de audio die uit de deurbel komt gaan omzetten naar tekst. Voor dit onderdeel maken we gebruik van de speech-to-text service uit Microsoft Cognitive services. We willen natuurlijk ook graag dat de deurbel iets tegen de persoon voor de deur staat zegt. Daarvoor moeten we een audiobestand genereren die weer naar de deurbel API kan worden gestuurd. Hiervoor gebruiken we de text-to-speech service

## Benodigdheden
- Cognitive services key, in te zien in het dashboard van je cognitive service resource (vxpdgcogservicesteam1 voor team 1).

## Stappen luisteren

1. Haal de audio op bij de deurbel, volg daarvoor: https://github.com/VXCompany/vrolijkevrijdag012023/tree/main/deurbel
2. De speech-to-text service verwacht een wave file, maar de deurbel geeft lever een MP3 aan. Voor C# kun je de https://github.com/naudio/NAudio package gebruiken om daarbij te helpen voor Java kun je gebruik maken van Jave http://www.sauronsoftware.it/projects/jave/.
3. Volg de quickstart om de wave file te analyzeren.

### Quickstarts
C#: https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/get-started-speech-to-text?tabs=windows%2Cterminal&pivots=programming-language-csharp <br>
Java: https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/get-started-speech-to-text?tabs=windows%2Cterminal&pivots=programming-language-java

## Stappen praten

1. Volg de quickstart om de tekst die je wilt laten uitspreken om te zetten naar audio.
2. De text-to-speech service levert een WAV file op, deze moet voor de deurbel omgezet worden naar een MP4 bestand. Deze kan opnieuw door NAudio of Jave worden gemaakt.
3. Stuur de audio file naar de deurbel API.

### Quickstarts
C#: https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/get-started-text-to-speech?tabs=windows%2Cterminal&pivots=programming-language-csharp
Java: https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/get-started-text-to-speech?tabs=windows%2Cterminal&pivots=programming-language-java

# <a name="section4"></a> Azure chatbot
Er moet natuurlijk iets gebeuren met de tekst die uit de deurbel komt om een antwoord te bepalen die weer naar de deurbel kunnen sturen. Je kunt dat natuurlijk eenvoudig doen door in je code op bepaalde input te controleren en vaste teksten terug te geven. Dat is wellicht een goede start. In deze workshop gaan we dit doen met een Azure bot en een getrainde "knowledge base".

## Echo bot in .NET
https://github.com/VXCompany/vrolijkevrijdag012023/tree/main/spraak/VX.PizzaDeliveryGuy.Bot bevat een 'echo bot' gemaakt in .NET, deze bot kan gebruikt worden als basis voor je eigen bot. 

Voor elk team is er al een .NET versie gedeployed naar Azure zodat je snel aan de slag kan. 

Team 1: https://vxpizzadeliveryguybotserviceteam1.azurewebsites.net/ <br>
Team 2: https://vxpizzadeliveryguybotserviceteam2.azurewebsites.net/ <br>
Team 3: https://vxpizzadeliveryguybotserviceteam3.azurewebsites.net/ <br>

Voor java kun je de instructies volgen in: https://learn.microsoft.com/en-us/azure/bot-service/bot-service-quickstart-create-bot?view=azure-bot-service-4.0&tabs=java%2Cvs om een bot te maken. 

Download en installeer de bot framework emulator om je bot lokaal te testen: https://github.com/Microsoft/BotFramework-Emulator/releases/tag/v4.14.1

## Deploy je bot naar Azure
Ga naar de rootfolder van je project:

```bash
az bot prepare-deploy --lang Csharp --code-dir "." --proj-file-path .\VX.PizzaDeliveryGuy.Bot.csproj
```

ZIP de volledige inhoud van de folder waar het .proj file in staat naar *vxpizzadeliveryguybot.zip*

```bash
az webapp deployment source config-zip --resource-group VrolijkTeam1 --name vxpizzadeliveryguybotserviceteam1 --src .\vxpizzadeliveryguybot.zip
```
<mark>
LET OP: ga naar de configuration van app service in het azure portal en ga naar general settings. Controleer of **stack** op .NET staat en .NET version op .NET 6 of 7 of op Java voor een bot in java.
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

## Trainen bot
De bot die je hebt gemaakt met dit template doet niks anders dan echo'en wat jij tegen hem zegt. Om de bot slimmer te maken kun je je eigen code schrijven die reageert op de input.

Als je dit extra interessant wilt maken kun je gebruiken van Microsoft Language Studio en dialogen trainen o.b.v. een dataset met voorbeeldzinnen. In de repo vind je een dataset die je kunt gebruiken: pizzaguy_data.csv.

Om dit te doen doe je het volgende:

- Volg om de juiste resource aan te maken: https://learn.microsoft.com/nl-nl/azure/cognitive-services/language-service/question-answering/quickstart/sdk?pivots=rest
- Ga naar: https://language.cognitive.azure.com/
- Maak een nieuwe "custom question answering" project aan en volg de instructies om azure search te koppelen
- Voeg de dataset toe via "add source"

In language studio kun je nu op basis van de geimporteerde teksten dialogen creeeren, speel hiermee en probeer een eenvoudige dialoog tussen persoon bij de deur en de bot te maken. Denk aan:

- Persoon bij de deur is de pizzabezorger
- Persoon bij de deur is iemand anders

Wil je testen, deploy dan je knowledgebase. Dit levert een URL en een key op die je kunt integreren in de chatbot. Bijv:

URL: https://vxpizzadeliveryguytextanalysys.cognitiveservices.azure.com/language/:query-knowledgebases?projectName=vxpizzadeliveryguyquestionmodel&api-version=2021-10-01&deploymentName=production
(Header) Ocp-Apim-Subscription-Key: ce2178f90b40406294c76b4896d64ebe


### De bot verbinden met je language model
Om je dialogen te integreren in je bot gebruik je de beschikbaar gemaakte url en key, deze accepteert een POST met een JSON body
```JSON
{
    "question": "de pizza bezorger"
}
```
En levert een JSON object op met mogelijke prompts

```JSON
{
	"answers": [
		{
			"questions": [
				"Ik kom een pizza bezorgen"
			],
			"answer": "pizza bezorger",
			"confidenceScore": 1.0,
			"id": 1,
			"source": "pizzaguy_data.xlsx",
			"metadata": {
				"system_metadata_qna_edited_manually": "true"
			},
			"dialog": {
				"isContextOnly": false,
				"prompts": [
					{
						"displayOrder": 0,
						"qnaId": 5,
						"displayText": "Voor wie is de pizza"
					}
				]
			}
		}
	]
}
```

Gebruik deze JSON om je antwoord door je chatbot te laten geven.

# <a name="section5"></a>OPTIONEEL: Azure resources aanmaken

Benodigdheden:
- Azure subscription
- Azure CLI: https://learn.microsoft.com/en-us/cli/azure/

Open een terminal in **"\spraak\VX.PizzaDeliveryGuy.Speech\Deployment"** en voer onderstaande azure commando's uit.

```bash
az login
az group create --name vxpizzadeliveryguyresources --location westeurope
az deployment group create --resource-group vxpizzadeliveryguyresources --template-file .\template.json --parameters .\parameters.json

Please provide string value for 'resourceGroupName' (? for help): vxpizzadeliveryguyresources
Please provide string value for 'resourceGroupId' (? for help): [id beschikbaar in response van 'az group create']
```
Je hebt nu een Azure Cognitive Services resource aangemaakt die je kunt gebruiken voor het omzetten van tekst naar spraak of spraak naar tekst.

Om de service te kunnen gebruiken in code heb je een key nodig, deze kun je via de CLI opvragen met

```bash
az cognitiveservices account keys list --name vxpizzaguyspeechservice --resource-group vxpizzadeliveryguyresources

```

## Chatbot resources
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
az deployment group create --resource-group vxpizzadeliveryguyresources --template-file .\template-BotApp-with-rg.json --parameters .\parameters-for-template-BotApp-with-rg.json

```
#### Aanmaken bot 

Open en pas de volgende velden aan.

- azureBotId: unieke naam (bijv. vxpizzadeliveryguybot + groepsnaam)    
- appId: clientid van de eerder aangemaakt identy.

```bash
az deployment group create --resource-group vxpizzadeliveryguyresources --template-file .\template-AzureBot-with-rg.json --parameters .\parameters-for-template-AzureBot-with-rg.json
```
