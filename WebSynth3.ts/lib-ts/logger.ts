export class Logger {
  static log(message: string, ...args?: any[]) {
    console.log(message, args)
  }

  static warn(message: string, ...args?: any[]) { 
    console.warn(message, args);
  }

  static error(message: string, ...args?: any[]){
    console.error(message, args);
  }
}
