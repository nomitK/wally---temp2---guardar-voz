let mediaRecorder;
let audioChunks = [];
let silenceTimeout;

// Verifique se a API SpeechRecognition está disponível
//const SpeechRecognition = window.SpeechRecognition || window.webkit.SpeechRecognition;
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || window.webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent


if (SpeechRecognition) {
  statusMessage.innerText = "SpeechRecognition está disponível. Você pode usar comandos de voz."; // Mensagem de sucesso
  var recognition = new SpeechRecognition();
  recognition.interimResults = true; 

  const heartContainer = document.getElementById('heartContainer');

  // Função para começar a gravação
  function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = event => {
                            audioChunks.push(event.data);
        };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        document.getElementById('audioPlayback').src = audioUrl;
        document.getElementById('audioPlayback').style.display = 'block';

         // Criar um link para download
        const downloadLink = document.getElementById('downloadLink');
        downloadLink.href = audioUrl;
        downloadLink.download = 'gravacao.wav';
        downloadLink.innerText = 'Baixar Gravação';
        downloadLink.style.display = 'block';

        audioChunks = []; // Limpar os chunks após a gravação
        heartContainer.style.animationPlayState = 'paused'; // Para a animação do coração
      };

        mediaRecorder.start();
        document.getElementById('stopButton').disabled = false;
        heartContainer.style.animationPlayState = 'running'; // Inicia a animação do coração

Para garantir que o coração pare de pulsar e a gravação seja interrompida após 3 segundos de silêncio, você precisa implementar um mecanismo que detecte o silêncio em áudio. 

Uma abordagem comum é monitorar a atividade do MediaRecorder para detectar se não há dados sendo gravados por um determinado período (neste caso, 3 segundos). No entanto, o MediaRecorder não tem uma maneira nativa de detectar silêncio, por isso vamos adicionar lógica manualmente.

Implementação Detalhada
Verificar Nível de Silêncio: Você pode usar a função onaudiostart para reiniciar um timeout quando há dados disponíveis.

Parar Gravação: Quando o timeout atinge 3 segundos, a gravação deve ser parada.

Aqui está um código revisado que implementa essa lógica:

Código JavaScript Atualizado
javascript
Copy
let mediaRecorder;
let audioChunks = [];
let silenceTimeout;
const SILENCE_THRESHOLD = 3000; // 3 segundos

// Verifique se a API SpeechRecognition está disponível
const SpeechRecognition = window.SpeechRecognition || window.webkit.SpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.interimResults = true; 

    const heartContainer = document.getElementById('heartContainer');

    // Função para parar a gravação
    function stopRecording() {
        mediaRecorder.stop();
        clearTimeout(silenceTimeout); // Limpa o tempo limite de silêncio
        document.getElementById('stopButton').disabled = true;
        heartContainer.style.animationPlayState = 'paused'; // Para a animação do coração
    }

    // Função para começar a gravação
    function startRecording() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream);

                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    document.getElementById('audioPlayback').src = audioUrl;
                    document.getElementById('audioPlayback').style.display = 'block';

                    // Criar um link para download
                    const downloadLink = document.getElementById('downloadLink');
                    downloadLink.href = audioUrl;
                    downloadLink.download = 'gravacao.wav';
                    downloadLink.innerText = 'Baixar Gravação';
                    downloadLink.style.display = 'block';

                    audioChunks = []; // Limpar os chunks após a gravação
                };

                mediaRecorder.start();
                document.getElementById('stopButton').disabled = false;
                heartContainer.style.animationPlayState = 'running'; // Inicia a animação do coração
                
                // Reiniciar o timeout de silêncio sempre que há dados
                silenceTimeout = setTimeout(stopRecording, SILENCE_THRESHOLD); // Inicia o timeout de silêncio

                mediaRecorder.onstart = () => {
                    // Reinicia o timeout a cada fragmento de áudio recebido
                    mediaRecorder.ondataavailable = (event) => {
                        audioChunks.push(event.data);
                        clearTimeout(silenceTimeout); // Limpa o timeout a cada dado disponível
                        silenceTimeout = setTimeout(stopRecording, SILENCE_THRESHOLD); // Reinicia o timeout
                    };
                };
            })
        .catch(err => console.error('Erro ao acessar o microfone: ', err));
      }



    function stopRecording() {
        mediaRecorder.stop();
        clearTimeout(silenceTimeout); // Limpa o tempo limite de silêncio
        document.getElementById('stopButton').disabled = true;
        heartContainer.style.animationPlayState = 'paused'; // Para a animação do coração
    }
  
    recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    console.log(transcript); // Para depuração

    if (transcript.includes('inner')) {
                    startRecording(); // Chama a função para iniciar a gravação se "inner" for detectada
      } else if (transcript.includes('stop')) {
            stopRecording(); // Para a gravação se "stop" for dita
    }
    };


   recognition.onerror = (event) => {
      console.error('Erro de reconhecimento: ', event.error);
    };

    recognition.onend = () => {
      recognition.start(); // Reinicia o reconhecimento após terminar
    };

  recognition.start(); // Inicia o reconhecimento quando a página carrega

} else {
  console.error("SpeechRecognition não suportado neste navegador.");
   alert("Desculpe, esta funcionalidade de reconhecimento de voz não é suportada pelo seu navegador.");
}
