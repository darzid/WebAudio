Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};
Number.prototype.countDecimals = function () {
    if(Math.floor(this.valueOf()) === this.valueOf()) return 0;
    return this.toString().split(".")[1].length || 0; 
}
