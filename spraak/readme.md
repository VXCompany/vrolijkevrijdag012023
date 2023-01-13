# Wie staat daar voor de deur?
Zodra er aangebeld wordt moeten we er achter gaan komen wie er bij de deur staat en deze persoon op de juiste manier beantwoorden. Om dat te bereiken gaan we een drietal onderdelen bouwen.

- *Luisteren*: We maken een speech to text engine met azure cognitive services die de audio uit de deurbel omzet naar geschreven tekst.

- *Spreken*: We maken een text to speech engine met azure cognitive services die de text uit het language model omzet naar een audio bestand die we de deurbel kunnen laten afspelen.

- *Analyzeren*: We maken en trainen een language model die ons kan helpen te bepalen wie er voor de deur staat en welke vragen we moeten stellen.

# Wat heb je nodig?

- Azure subscription
- Azure CLI

`
az login
az group create --name vxpizzadeliveryguyresources --location westeurope
`




Situaties:

1) Moeder staat voor de deur.
2) Postbode
3) Pizza bezorger; niet voor bewoner
4) Persoon voor wie pizza is belt aan
5) Mensen die alcohol laten bezorgen
6) Pizza bezorger: voor bewoner