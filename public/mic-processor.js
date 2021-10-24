class MicProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputList, outputList, parameters) {
    console.log(inputList)
    return true;
  }
};

console.log('register')
registerProcessor("mic-processor", MicProcessor);