var LinkedList = null;
var ListNode = null;

ModuleManager.load(
['/lib/Base.js'],
function()
{

/**
 * Láncolt listát megvalósító osztály.
 */ 
LinkedList = Base.extend(
{
  /**
   * Alapértelmezett konstruktor.         
   */   
  constructor : function()
  {
    // Kezdő, záró elem
    this.first = this.last = null;
    // Láncolt lista hossza
    this.length = 0;
  },                          
  
  /**
   * Elem hozzáadása a lista végéhez.
   *    
   * @param listNode {ListNode} az új listaelem
   * @return {ListNode?null} az újonnan beszúrt listaelem, vagy hiba esetén null      
   */
  append : function(listNode)
  {
    if (!(listNode instanceof ListNode)) return null;
    
    if (null !== this.last)
      this.last.next = listNode;
    
    listNode.prev = this.last;
    this.last = listNode;
  
    if (null === this.first)
      this.first = listNode;
    
    this.length++;
    
    return listNode;
  }, 

  /**
   * Elem eltávolítása a listából.
   *    
   * @param listNode {ListNode} az eltávolítandó listaelem
   * @return {ListNode?null} az eltávolított listaelem, vagy hiba esetén null      
   */  
  remove : function(listNode)
  {
    if (!(listNode instanceof ListNode)) return null;
      
    if (null !== listNode.next)
      listNode.next.prev = listNode.prev;
    
    if (null != listNode.prev)
      listNode.prev.next = listNode.next;
    
    if (listNode == this.last)
      this.last = this.last.prev;
    
    if (listNode == this.first)
      this.first = this.first.next;
    
    this.length--;
    
    return listNode;
  },
  
  /**
   * Listaelem megkeresése az általa tárolt adat alapján.
   * NOTE: - a  keresés az első találat után véget ér
   *   
   * @param data {Object?null} a kulcsként szolgáló adat          
   */   
  findFirst : function(data)
  {
    if ('undefined' === typeof(data)) return null;
      
    var node = this.first;
    while(node)
    {
      if (node.data === data)
        return node;
      
      node = node.next;
    }
  
    return null;
  },
  
  /**
   * Láncolt lista átalakítása tömbbé.
   *    
   * @return {Array} a láncolt lista tömbként   
   */   
  toArray : function()
  {
    var a = new Array();
     
    var i = 0;
    var node = this.first;
    while(node)
    {
      a[i++] = node.data; 
      node = node.next;
    } 
     
    return a;
  },  
  
  toString: function ()
  {
    return 'LinkedList';
  }
});

/**
 * Listaelemet megvalósító osztály.
 */
ListNode = Base.extend(
{
  /**
   * Alapértelmezett konstruktor.
   * 
   * @param data {Object?null?undefined} a listaelem által tárolt adat      
   */     
  constructor : function(data)
  { 
    this.prev = this.next = null;
    this.data = ('undefined' !== typeof(data)) ? data : null;
  },
  
  toString: function()
  {
    return 'ListNode';
  }

});

ModuleManager.ready('LinkedList');  

}); 