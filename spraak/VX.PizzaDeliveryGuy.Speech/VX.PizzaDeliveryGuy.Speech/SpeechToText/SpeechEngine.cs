using Microsoft.CognitiveServices.Speech;
using Microsoft.CognitiveServices.Speech.Audio;
using NAudio.MediaFoundation;
using NAudio.Wave;
using VX.PizzaDeliveryGuy.Speech.ChatBotClient;

namespace VX.PizzaDeliveryGuy.Speech.SpeechToText
{
    public class SpeechEngine
    {
        private const string KEY = "9f726dbbb8ac4bddad05bf5e5d39aa08";
        private const string REGION = "westeurope";
        private SpeechConfig speechConfig;
        private BotConversation? botConversation;

        public SpeechEngine()
        {
            speechConfig = SpeechConfig.FromSubscription(KEY, REGION);
            speechConfig.SpeechRecognitionLanguage = "nl-NL";
            speechConfig.SpeechSynthesisLanguage = "nl-NL";
        }

        public async Task Speak(SpeakRequest text)
        {
            using var audioConfig = AudioConfig.FromDefaultMicrophoneInput();
            using var speechSynthesizer = new SpeechSynthesizer(speechConfig, audioConfig);

            var result = await speechSynthesizer.SpeakTextAsync(text.Content);

            MediaFoundationApi.Startup();

            File.WriteAllBytes("c:\\temp\\recording.wav", result.AudioData);
            using (var reader = new MediaFoundationReader("c:\\temp\\recording.wav"))
            {
                MediaFoundationEncoder.EncodeToAac(reader, "c:\\temp\\encodedfile.mp4");
            }

        }

        public async Task<ListResponse> Listen(ListenRequest listenRequest)
        {
            var OutputAudioFilePath = $"{listenRequest.AudioFilePath}temp.wav";
            CreateWaveFileFromSourceAudio(listenRequest, OutputAudioFilePath);

            using var audioConfig = AudioConfig.FromWavFileInput(OutputAudioFilePath);
            using var speechRecognizer = new SpeechRecognizer(speechConfig, audioConfig);

            var speechRecognitionResult = await speechRecognizer.RecognizeOnceAsync();

            if (botConversation == null)
            {
                botConversation = await BotConversation.StartConversation();
            }

            var botConversationResult = await botConversation.SendMessage("deurbel", speechRecognitionResult.Text);

            return new ListResponse(botConversationResult, "test");
        }

        private static void CreateWaveFileFromSourceAudio(ListenRequest listenRequest, string OutputAudioFilePath)
        {
            using (MediaFoundationReader reader = new MediaFoundationReader($"{listenRequest.AudioFilePath}{listenRequest.AudioFileName}"))
            {
                WaveFileWriter.CreateWaveFile(OutputAudioFilePath, reader);
            }
        }
    }
}
