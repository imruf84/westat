# Az alábbi lekérdezés másolatot készít egy órarend kötelezõ óráiról egy másik órarendre

INSERT INTO kotelezoorak

(felhasznaloID,orarendID,het,ora0,ora1,ora2,ora3,ora4)

(SELECT felhasznaloID,'2011-03-10',het,ora0,ora1,ora2,ora3,ora4 FROM kotelezoorak WHERE orarendID='2011-02-28')