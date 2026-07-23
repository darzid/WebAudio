export class Logger {
  static log(message: string, ...args?: any | any[] | null) {
    console.log(message, args)
  }

  static warn(message: string, ...args?: any | any[] | null) { 
    console.warn(message, args);
  }

  static error(message: string, ...args?: any | any[]){
    console.error(message, args);
  }
}
