/* Magyar karakterkódok:

   Á:\u00c1 á:\u00e1
   É:\u00c9 é:\u00e9
   Í:\u00cd í:\u00ed
   Ó:\u00d3 ó:\u00f3
   Ö:\u00d6 ö:\u00f6
   Ú:\u00da ú:\u00fa
   Ü:\u00dc ü:\u00fc
   Ő:\u0150 ő:\u0151
   Ű:\u0170 ű:\u0171
   ▲:\u25b2
   ▼:\u25bc
   ' ':\u00a0
   
 */

function containsNonLatinCodepoints(s) 
{
  return /[^\u0000-\u00ff]/.test(s);
}
