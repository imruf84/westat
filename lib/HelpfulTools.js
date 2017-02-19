/**
 * Hasznos függvényeket tartalmazó állomány.
 */ 

/**
 * Hét napjait tartalmazó tömb előállítása.
 * 
 * @return {Array of string} a hét napjait tartalmazó tömb  
 */ 
function daysOfWeekArray()
{
  return new Array('H\u00e9tf\u0151','Kedd','Szerda',
                   'Cs\u00fct\u00f6rt\u00f6k','P\u00e9ntek');
}

/**
 * Tömb többszörösen előforduló elemeinek a törlése.
 * 
 * @param a {Array} a vizsgálandó tömb
 * @return {Array?null} a tömb ismétlődő elemek nélkül, vagy hiba esetén null   
 */ 
function removeDuplicates(a)
{
  if (!(a instanceof Array)) return null;

  var r = new Array();
  o:for(var i = 0, n = a.length; i < n; i++)
  {
    for(var x = 0, y = r.length; x < y; x++)
    {
      if(r[x]==a[i]) continue o;
    }
    r[r.length] = a[i];
  }
   
  return r;
}

/**
 * Objektum kijelölhetőségének a letiltása.
 */ 
function disableSelection(dom)
{
  // Szöveg kijelölésének a letiltása
  if ('undefined' !== typeof(dom.onselectstart))
	  dom.onselectstart = function(){return false};
  else 
    if ('undefined' !== typeof(dom.style.MozUserSelect))
	    dom.style.MozUserSelect = 'none';
    else
      if ('undefined' !== typeof(dom.style.WebkitUserSelect))
        dom.style.WebkitUserSelect = 'none';
      else
	      dom.onmousedown = function(){return false};
	      
	return dom;
}

/**
 * Tömb objektum kiterjesztése adat tesztelésére.
 */ 
Array.prototype.indexOf = function(obj) 
{
  for (var i = 0; i < this.length; i++) 
  {
    if (this[i] == obj) return i;
  }
  
  return -1;
}

Array.prototype.has = function(obj) 
{
  return (this.indexOf(obj) >= 0);
}

Array.prototype.sum = function()
{
	for (var i=0,sum=0;i<this.length;sum+=this[i++]);
	
	return sum;
}

Array.prototype.max = function()
{
	return Math.max.apply({},this)
}

Array.prototype.min = function()
{
	return Math.min.apply({},this)
}

ModuleManager.ready('HelpfulTools');