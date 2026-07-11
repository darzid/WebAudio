class ConvolutionGenerator {
 static createImpulseResponse(audioContext, reverbSize, reverbType, decayTime, decayDirection) {
  var channels = 2;
  var sampleRate = audioContext.sampleRate;
  var length = sampleRate * reverbSize;
  
  var audioBuffer = audioContext.createBuffer(channels, length, sampleRate);
  audioBuffer.contentType = "audio/wav";
  
  for (var channel = 0; channel < channels; channel++) {
   var channelData_AudioBuffer = audioBuffer.getChannelData(channel);
   for (var i = 0; i < length; i++) {
    switch (reverbType) {
     case "negpos":
      ConvolutionGenerator.calcNegativeAndPositiveDecay(channelData_AudioBuffer, i, length);
      break;
     case "pos":
      ConvolutionGenerator.calcPositiveDecay(channelData_AudioBuffer, i);
      break;
     case "log":
      ConvolutionGenerator.calcLogarithmicDecay(channelData_AudioBuffer, i, length, decayTime, decayDirection);
      break;
     default:
      throw new Error("Unsupported type");
    }
   }
  }
  
  return audioBuffer;
 }
 
 static calcNegativeAndPositiveDecay(channelData_AudioBuffer, i, length)
 {
  if (i < Math.floor(channelData_AudioBuffer.length / 2))
   channelData_AudioBuffer[i] = 0;
  else
   channelData_AudioBuffer[i] = Math.pow(-1, i);
 }
 
 static calcPositiveDecay(channelData_AudioBuffer, i) {
  channelData_AudioBuffer[i] = Math.pow(-1, i);
 }
 
 static calcLogarithmicDecay(channelData_AudioBuffer, i, length, decayTime, decayDirection) {
  var n = (decayDirection == "backward") ? length - i : i;
  channelData_AudioBuffer[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decayTime);
 }
}