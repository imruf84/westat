/**
 * Saját matematikai függvényeket tartalmazó objektum. 
 */
MyMath = 
{
  /**
   * Lineáris interpoláció
   */     
  linInterp : function(x0,y0,x1,y1,x)
  {
    if (0 === ((x0*x0)-(x1*x1))) return (y0+y1)/2;
    if (x === x0) return y0;
    if (x === x1) return y1;
      
    return y0*(x - x1)/(x0 - x1) + y1*(x - x0)/(x1 - x0);
  }
};

ModuleManager.ready('MyMath');