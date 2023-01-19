using VX.PizzaDeliveryGuy.Speech.SpeechToText;

var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

app.MapGet("/", () => { return "Pizza delivery guy!"; });
app.MapPost("/speak", async (SpeakRequest sentence) => { 
    SpeechEngine speechEngine = new SpeechEngine();
    await speechEngine.Speak(sentence);
    return "Text processed";
});

app.MapPost("/listen", async (ListenRequest listenRequest) =>
{
    SpeechEngine speechEngine = new SpeechEngine();
    return await speechEngine.Listen(listenRequest);
});

app.Run();

