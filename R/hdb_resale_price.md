# HDB Resale Prices
Yong Jun  
December 6, 2015  


```r
library(data.table)
library(jsonlite)
library(manipulate)
library(ggplot2)
library(plyr)
```


```r
raw1 <- read.csv('resale_prices_2000.csv', strip.white=TRUE, stringsAsFactors=FALSE)
raw2 <- read.csv('resale_prices_2005.csv', strip.white=TRUE, stringsAsFactors=FALSE)
raw3 <- read.csv('resale_prices_2012.csv', strip.white=TRUE, stringsAsFactors=FALSE)
raw <- as.data.table(rbind(raw1,raw2,raw3))
raw$month <- as.factor(raw$month)
raw$town <- as.factor(raw$town)
raw$flat_type <- as.factor(raw$flat_type)
raw$street_name <- as.factor(raw$street_name)
raw$storey_range <- as.factor(raw$storey_range)
raw$flat_model <- as.factor(raw$flat_model)
setkey(raw,town,flat_type,month,storey_range)
```


```r
levels(raw$town)
```

```
##  [1] "ANG MO KIO"      "BEDOK"           "BISHAN"         
##  [4] "BUKIT BATOK"     "BUKIT MERAH"     "BUKIT PANJANG"  
##  [7] "BUKIT TIMAH"     "CENTRAL AREA"    "CHOA CHU KANG"  
## [10] "CLEMENTI"        "GEYLANG"         "HOUGANG"        
## [13] "JURONG EAST"     "JURONG WEST"     "KALLANG/WHAMPOA"
## [16] "MARINE PARADE"   "PASIR RIS"       "PUNGGOL"        
## [19] "QUEENSTOWN"      "SEMBAWANG"       "SENGKANG"       
## [22] "SERANGOON"       "TAMPINES"        "TOA PAYOH"      
## [25] "WOODLANDS"       "YISHUN"
```

```r
levels(raw$flat_type)
```

```
## [1] "1 ROOM"           "2 ROOM"           "3 ROOM"          
## [4] "4 ROOM"           "5 ROOM"           "EXECUTIVE"       
## [7] "MULTI-GENERATION"
```

```r
levels(raw$month)
```

```
##   [1] "2000-01" "2000-02" "2000-03" "2000-04" "2000-05" "2000-06" "2000-07"
##   [8] "2000-08" "2000-09" "2000-10" "2000-11" "2000-12" "2001-01" "2001-02"
##  [15] "2001-03" "2001-04" "2001-05" "2001-06" "2001-07" "2001-08" "2001-09"
##  [22] "2001-10" "2001-11" "2001-12" "2002-01" "2002-02" "2002-03" "2002-04"
##  [29] "2002-05" "2002-06" "2002-07" "2002-08" "2002-09" "2002-10" "2002-11"
##  [36] "2002-12" "2003-01" "2003-02" "2003-03" "2003-04" "2003-05" "2003-06"
##  [43] "2003-07" "2003-08" "2003-09" "2003-10" "2003-11" "2003-12" "2004-01"
##  [50] "2004-02" "2004-03" "2004-04" "2004-05" "2004-06" "2004-07" "2004-08"
##  [57] "2004-09" "2004-10" "2004-11" "2004-12" "2005-01" "2005-02" "2005-03"
##  [64] "2005-04" "2005-05" "2005-06" "2005-07" "2005-08" "2005-09" "2005-10"
##  [71] "2005-11" "2005-12" "2006-01" "2006-02" "2006-03" "2006-04" "2006-05"
##  [78] "2006-06" "2006-07" "2006-08" "2006-09" "2006-10" "2006-11" "2006-12"
##  [85] "2007-01" "2007-02" "2007-03" "2007-04" "2007-05" "2007-06" "2007-07"
##  [92] "2007-08" "2007-09" "2007-10" "2007-11" "2007-12" "2008-01" "2008-02"
##  [99] "2008-03" "2008-04" "2008-05" "2008-06" "2008-07" "2008-08" "2008-09"
## [106] "2008-10" "2008-11" "2008-12" "2009-01" "2009-02" "2009-03" "2009-04"
## [113] "2009-05" "2009-06" "2009-07" "2009-08" "2009-09" "2009-10" "2009-11"
## [120] "2009-12" "2010-01" "2010-02" "2010-03" "2010-04" "2010-05" "2010-06"
## [127] "2010-07" "2010-08" "2010-09" "2010-10" "2010-11" "2010-12" "2011-01"
## [134] "2011-02" "2011-03" "2011-04" "2011-05" "2011-06" "2011-07" "2011-08"
## [141] "2011-09" "2011-10" "2011-11" "2011-12" "2012-01" "2012-02" "2012-03"
## [148] "2012-04" "2012-05" "2012-06" "2012-07" "2012-08" "2012-09" "2012-10"
## [155] "2012-11" "2012-12" "2013-01" "2013-02" "2013-03" "2013-04" "2013-05"
## [162] "2013-06" "2013-07" "2013-08" "2013-09" "2013-10" "2013-11" "2013-12"
## [169] "2014-01" "2014-02" "2014-03" "2014-04" "2014-05" "2014-06" "2014-07"
## [176] "2014-08" "2014-09" "2014-10" "2014-11" "2014-12" "2015-01" "2015-02"
## [183] "2015-03" "2015-04" "2015-05" "2015-06" "2015-07" "2015-08" "2015-09"
```

```r
levels(raw$flat_model)
```

```
##  [1] "2-room"              "Adjoined flat"       "Apartment"          
##  [4] "DBSS"                "Improved"            "Improved-Maisonette"
##  [7] "Maisonette"          "Model A"             "Model A2"           
## [10] "Model A-Maisonette"  "Multi Generation"    "New Generation"     
## [13] "Premium Apartment"   "Premium Maisonette"  "Simplified"         
## [16] "Standard"            "Terrace"             "Type S1"            
## [19] "Type S2"
```

```r
levels(raw$storey_range)
```

```
##  [1] "01 TO 03" "01 TO 05" "04 TO 06" "06 TO 10" "07 TO 09" "10 TO 12"
##  [7] "11 TO 15" "13 TO 15" "16 TO 18" "16 TO 20" "19 TO 21" "21 TO 25"
## [13] "22 TO 24" "25 TO 27" "26 TO 30" "28 TO 30" "31 TO 33" "31 TO 35"
## [19] "34 TO 36" "36 TO 40" "37 TO 39" "40 TO 42" "43 TO 45" "46 TO 48"
## [25] "49 TO 51"
```

```r
levels(raw$street_name)
```

```
##   [1] "ADMIRALTY DR"           "ADMIRALTY LINK"        
##   [3] "AH HOOD RD"             "ALJUNIED CRES"         
##   [5] "ALJUNIED RD"            "ANCHORVALE DR"         
##   [7] "ANCHORVALE LANE"        "ANCHORVALE LINK"       
##   [9] "ANCHORVALE RD"          "ANG MO KIO AVE 1"      
##  [11] "ANG MO KIO AVE 10"      "ANG MO KIO AVE 2"      
##  [13] "ANG MO KIO AVE 3"       "ANG MO KIO AVE 4"      
##  [15] "ANG MO KIO AVE 5"       "ANG MO KIO AVE 6"      
##  [17] "ANG MO KIO AVE 8"       "ANG MO KIO AVE 9"      
##  [19] "ANG MO KIO ST 11"       "ANG MO KIO ST 21"      
##  [21] "ANG MO KIO ST 31"       "ANG MO KIO ST 32"      
##  [23] "ANG MO KIO ST 52"       "BAIN ST"               
##  [25] "BALAM RD"               "BANGKIT RD"            
##  [27] "BEACH RD"               "BEDOK CTRL"            
##  [29] "BEDOK NTH AVE 1"        "BEDOK NTH AVE 2"       
##  [31] "BEDOK NTH AVE 3"        "BEDOK NTH AVE 4"       
##  [33] "BEDOK NTH RD"           "BEDOK NTH ST 1"        
##  [35] "BEDOK NTH ST 2"         "BEDOK NTH ST 3"        
##  [37] "BEDOK NTH ST 4"         "BEDOK RESERVOIR RD"    
##  [39] "BEDOK RESERVOIR VIEW"   "BEDOK STH AVE 1"       
##  [41] "BEDOK STH AVE 2"        "BEDOK STH AVE 3"       
##  [43] "BEDOK STH RD"           "BENDEMEER RD"          
##  [45] "BEO CRES"               "BISHAN ST 11"          
##  [47] "BISHAN ST 12"           "BISHAN ST 13"          
##  [49] "BISHAN ST 22"           "BISHAN ST 23"          
##  [51] "BISHAN ST 24"           "BOON KENG RD"          
##  [53] "BOON LAY AVE"           "BOON LAY DR"           
##  [55] "BOON LAY PL"            "BOON TIONG RD"         
##  [57] "BRIGHT HILL DR"         "BT BATOK CTRL"         
##  [59] "BT BATOK EAST AVE 3"    "BT BATOK EAST AVE 4"   
##  [61] "BT BATOK EAST AVE 5"    "BT BATOK ST 11"        
##  [63] "BT BATOK ST 21"         "BT BATOK ST 22"        
##  [65] "BT BATOK ST 24"         "BT BATOK ST 25"        
##  [67] "BT BATOK ST 31"         "BT BATOK ST 32"        
##  [69] "BT BATOK ST 33"         "BT BATOK ST 34"        
##  [71] "BT BATOK ST 51"         "BT BATOK ST 52"        
##  [73] "BT BATOK WEST AVE 2"    "BT BATOK WEST AVE 4"   
##  [75] "BT BATOK WEST AVE 5"    "BT BATOK WEST AVE 6"   
##  [77] "BT BATOK WEST AVE 7"    "BT BATOK WEST AVE 8"   
##  [79] "BT MERAH CTRL"          "BT MERAH LANE 1"       
##  [81] "BT MERAH VIEW"          "BT PANJANG RING RD"    
##  [83] "BT PURMEI RD"           "BUANGKOK CRES"         
##  [85] "BUANGKOK LINK"          "BUFFALO RD"            
##  [87] "CAMBRIDGE RD"           "CANBERRA LINK"         
##  [89] "CANBERRA RD"            "CANTONMENT CL"         
##  [91] "CANTONMENT RD"          "CASHEW RD"             
##  [93] "CASSIA CRES"            "CHAI CHEE AVE"         
##  [95] "CHAI CHEE DR"           "CHAI CHEE RD"          
##  [97] "CHAI CHEE ST"           "CHANDER RD"            
##  [99] "CHANGI VILLAGE RD"      "CHIN SWEE RD"          
## [101] "CHOA CHU KANG AVE 1"    "CHOA CHU KANG AVE 2"   
## [103] "CHOA CHU KANG AVE 3"    "CHOA CHU KANG AVE 4"   
## [105] "CHOA CHU KANG AVE 5"    "CHOA CHU KANG CRES"    
## [107] "CHOA CHU KANG CTRL"     "CHOA CHU KANG DR"      
## [109] "CHOA CHU KANG LOOP"     "CHOA CHU KANG NTH 5"   
## [111] "CHOA CHU KANG NTH 6"    "CHOA CHU KANG NTH 7"   
## [113] "CHOA CHU KANG ST 51"    "CHOA CHU KANG ST 52"   
## [115] "CHOA CHU KANG ST 53"    "CHOA CHU KANG ST 54"   
## [117] "CHOA CHU KANG ST 62"    "CHOA CHU KANG ST 64"   
## [119] "CIRCUIT RD"             "CLARENCE LANE"         
## [121] "CLEMENTI AVE 1"         "CLEMENTI AVE 2"        
## [123] "CLEMENTI AVE 3"         "CLEMENTI AVE 4"        
## [125] "CLEMENTI AVE 5"         "CLEMENTI AVE 6"        
## [127] "CLEMENTI ST 11"         "CLEMENTI ST 12"        
## [129] "CLEMENTI ST 13"         "CLEMENTI ST 14"        
## [131] "CLEMENTI WEST ST 1"     "CLEMENTI WEST ST 2"    
## [133] "COMPASSVALE BOW"        "COMPASSVALE CRES"      
## [135] "COMPASSVALE DR"         "COMPASSVALE LANE"      
## [137] "COMPASSVALE LINK"       "COMPASSVALE RD"        
## [139] "COMPASSVALE ST"         "COMPASSVALE WALK"      
## [141] "CORPORATION DR"         "CRAWFORD LANE"         
## [143] "C'WEALTH AVE"           "C'WEALTH AVE WEST"     
## [145] "C'WEALTH CL"            "C'WEALTH CRES"         
## [147] "C'WEALTH DR"            "DAKOTA CRES"           
## [149] "DELTA AVE"              "DEPOT RD"              
## [151] "DORSET RD"              "DOVER CL EAST"         
## [153] "DOVER CRES"             "DOVER RD"              
## [155] "EAST COAST RD"          "EDGEDALE PLAINS"       
## [157] "EDGEFIELD PLAINS"       "ELIAS RD"              
## [159] "EMPRESS RD"             "EUNOS CRES"            
## [161] "EUNOS RD 5"             "EVERTON PK"            
## [163] "FAJAR RD"               "FARRER PK RD"          
## [165] "FARRER RD"              "FERNVALE LANE"         
## [167] "FERNVALE LINK"          "FERNVALE RD"           
## [169] "FRENCH RD"              "GANGSA RD"             
## [171] "GEYLANG BAHRU"          "GEYLANG EAST AVE 1"    
## [173] "GEYLANG EAST AVE 2"     "GEYLANG EAST CTRL"     
## [175] "GEYLANG SERAI"          "GHIM MOH LINK"         
## [177] "GHIM MOH RD"            "GLOUCESTER RD"         
## [179] "HAIG RD"                "HAVELOCK RD"           
## [181] "HENDERSON CRES"         "HENDERSON RD"          
## [183] "HO CHING RD"            "HOLLAND AVE"           
## [185] "HOLLAND CL"             "HOLLAND DR"            
## [187] "HOUGANG AVE 1"          "HOUGANG AVE 10"        
## [189] "HOUGANG AVE 2"          "HOUGANG AVE 3"         
## [191] "HOUGANG AVE 4"          "HOUGANG AVE 5"         
## [193] "HOUGANG AVE 6"          "HOUGANG AVE 7"         
## [195] "HOUGANG AVE 8"          "HOUGANG AVE 9"         
## [197] "HOUGANG CTRL"           "HOUGANG ST 11"         
## [199] "HOUGANG ST 21"          "HOUGANG ST 22"         
## [201] "HOUGANG ST 31"          "HOUGANG ST 51"         
## [203] "HOUGANG ST 52"          "HOUGANG ST 61"         
## [205] "HOUGANG ST 91"          "HOUGANG ST 92"         
## [207] "HOY FATT RD"            "INDUS RD"              
## [209] "JELAPANG RD"            "JELEBU RD"             
## [211] "JELLICOE RD"            "JLN BAHAGIA"           
## [213] "JLN BATU"               "JLN BERSEH"            
## [215] "JLN BT HO SWEE"         "JLN BT MERAH"          
## [217] "JLN DAMAI"              "JLN DUA"               
## [219] "JLN DUSUN"              "JLN KLINIK"            
## [221] "JLN KUKOH"              "JLN MA'MOR"            
## [223] "JLN MEMBINA"            "JLN PASAR BARU"        
## [225] "JLN RAJAH"              "JLN RUMAH TINGGI"      
## [227] "JLN TECK WHYE"          "JLN TENAGA"            
## [229] "JLN TENTERAM"           "JLN TIGA"              
## [231] "JOO CHIAT RD"           "JOO SENG RD"           
## [233] "JURONG EAST AVE 1"      "JURONG EAST ST 13"     
## [235] "JURONG EAST ST 21"      "JURONG EAST ST 24"     
## [237] "JURONG EAST ST 31"      "JURONG EAST ST 32"     
## [239] "JURONG WEST AVE 1"      "JURONG WEST AVE 3"     
## [241] "JURONG WEST AVE 5"      "JURONG WEST CTRL 1"    
## [243] "JURONG WEST ST 24"      "JURONG WEST ST 25"     
## [245] "JURONG WEST ST 41"      "JURONG WEST ST 42"     
## [247] "JURONG WEST ST 51"      "JURONG WEST ST 52"     
## [249] "JURONG WEST ST 61"      "JURONG WEST ST 62"     
## [251] "JURONG WEST ST 64"      "JURONG WEST ST 65"     
## [253] "JURONG WEST ST 71"      "JURONG WEST ST 72"     
## [255] "JURONG WEST ST 73"      "JURONG WEST ST 74"     
## [257] "JURONG WEST ST 75"      "JURONG WEST ST 81"     
## [259] "JURONG WEST ST 91"      "JURONG WEST ST 92"     
## [261] "JURONG WEST ST 93"      "KALLANG BAHRU"         
## [263] "KANG CHING RD"          "KELANTAN RD"           
## [265] "KENT RD"                "KG ARANG RD"           
## [267] "KG BAHRU HILL"          "KG KAYU RD"            
## [269] "KIM CHENG ST"           "KIM KEAT AVE"          
## [271] "KIM KEAT LINK"          "KIM PONG RD"           
## [273] "KIM TIAN PL"            "KIM TIAN RD"           
## [275] "KING GEORGE'S AVE"      "KLANG LANE"            
## [277] "KRETA AYER RD"          "LENGKOK BAHRU"         
## [279] "LENGKONG TIGA"          "LIM LIAK ST"           
## [281] "LOMPANG RD"             "LOR 1 TOA PAYOH"       
## [283] "LOR 2 TOA PAYOH"        "LOR 3 GEYLANG"         
## [285] "LOR 3 TOA PAYOH"        "LOR 4 TOA PAYOH"       
## [287] "LOR 5 TOA PAYOH"        "LOR 6 TOA PAYOH"       
## [289] "LOR 7 TOA PAYOH"        "LOR 8 TOA PAYOH"       
## [291] "LOR AH SOO"             "LOR LEW LIAN"          
## [293] "LOR LIMAU"              "LOWER DELTA RD"        
## [295] "MACPHERSON LANE"        "MARGARET DR"           
## [297] "MARINE CRES"            "MARINE DR"             
## [299] "MARINE PARADE CTRL"     "MARINE TER"            
## [301] "MARSILING CRES"         "MARSILING DR"          
## [303] "MARSILING LANE"         "MARSILING RD"          
## [305] "MARSILING RISE"         "MCNAIR RD"             
## [307] "MEI LING ST"            "MOH GUAN TER"          
## [309] "MONTREAL DR"            "MOULMEIN RD"           
## [311] "NEW MKT RD"             "NEW UPP CHANGI RD"     
## [313] "NTH BRIDGE RD"          "OLD AIRPORT RD"        
## [315] "OWEN RD"                "PANDAN GDNS"           
## [317] "PASIR RIS DR 1"         "PASIR RIS DR 10"       
## [319] "PASIR RIS DR 3"         "PASIR RIS DR 4"        
## [321] "PASIR RIS DR 6"         "PASIR RIS ST 11"       
## [323] "PASIR RIS ST 12"        "PASIR RIS ST 13"       
## [325] "PASIR RIS ST 21"        "PASIR RIS ST 41"       
## [327] "PASIR RIS ST 51"        "PASIR RIS ST 52"       
## [329] "PASIR RIS ST 53"        "PASIR RIS ST 71"       
## [331] "PASIR RIS ST 72"        "PAYA LEBAR WAY"        
## [333] "PENDING RD"             "PETIR RD"              
## [335] "PINE CL"                "PIPIT RD"              
## [337] "POTONG PASIR AVE 1"     "POTONG PASIR AVE 2"    
## [339] "POTONG PASIR AVE 3"     "PUNGGOL CTRL"          
## [341] "PUNGGOL DR"             "PUNGGOL EAST"          
## [343] "PUNGGOL FIELD"          "PUNGGOL FIELD WALK"    
## [345] "PUNGGOL PL"             "PUNGGOL RD"            
## [347] "QUEEN'S CL"             "QUEEN'S RD"            
## [349] "QUEEN ST"               "QUEENSWAY"             
## [351] "RACE COURSE RD"         "REDHILL CL"            
## [353] "REDHILL LANE"           "REDHILL RD"            
## [355] "RIVERVALE CRES"         "RIVERVALE DR"          
## [357] "RIVERVALE ST"           "RIVERVALE WALK"        
## [359] "ROCHOR RD"              "ROWELL RD"             
## [361] "SAGO LANE"              "SAUJANA RD"            
## [363] "SEGAR RD"               "SELEGIE RD"            
## [365] "SELETAR WEST FARMWAY 6" "SEMBAWANG CL"          
## [367] "SEMBAWANG CRES"         "SEMBAWANG DR"          
## [369] "SEMBAWANG VISTA"        "SEMBAWANG WAY"         
## [371] "SENGKANG CTRL"          "SENGKANG EAST RD"      
## [373] "SENGKANG EAST WAY"      "SENGKANG WEST AVE"     
## [375] "SENG POH RD"            "SENJA LINK"            
## [377] "SENJA RD"               "SERANGOON AVE 1"       
## [379] "SERANGOON AVE 2"        "SERANGOON AVE 3"       
## [381] "SERANGOON AVE 4"        "SERANGOON CTRL"        
## [383] "SERANGOON CTRL DR"      "SERANGOON NTH AVE 1"   
## [385] "SERANGOON NTH AVE 2"    "SERANGOON NTH AVE 3"   
## [387] "SERANGOON NTH AVE 4"    "SHUNFU RD"             
## [389] "SILAT AVE"              "SIMEI RD"              
## [391] "SIMEI ST 1"             "SIMEI ST 2"            
## [393] "SIMEI ST 4"             "SIMEI ST 5"            
## [395] "SIMS AVE"               "SIMS DR"               
## [397] "SIMS PL"                "SIN MING AVE"          
## [399] "SIN MING RD"            "SMITH ST"              
## [401] "SPOTTISWOODE PK RD"     "ST. GEORGE'S LANE"     
## [403] "ST. GEORGE'S RD"        "STIRLING RD"           
## [405] "STRATHMORE AVE"         "TAH CHING RD"          
## [407] "TAMAN HO SWEE"          "TAMPINES AVE 4"        
## [409] "TAMPINES AVE 5"         "TAMPINES AVE 7"        
## [411] "TAMPINES AVE 8"         "TAMPINES AVE 9"        
## [413] "TAMPINES CTRL 1"        "TAMPINES CTRL 7"       
## [415] "TAMPINES ST 11"         "TAMPINES ST 12"        
## [417] "TAMPINES ST 21"         "TAMPINES ST 22"        
## [419] "TAMPINES ST 23"         "TAMPINES ST 24"        
## [421] "TAMPINES ST 32"         "TAMPINES ST 33"        
## [423] "TAMPINES ST 34"         "TAMPINES ST 41"        
## [425] "TAMPINES ST 42"         "TAMPINES ST 43"        
## [427] "TAMPINES ST 44"         "TAMPINES ST 45"        
## [429] "TAMPINES ST 71"         "TAMPINES ST 72"        
## [431] "TAMPINES ST 81"         "TAMPINES ST 82"        
## [433] "TAMPINES ST 83"         "TAMPINES ST 84"        
## [435] "TAMPINES ST 91"         "TANGLIN HALT RD"       
## [437] "TAO CHING RD"           "TEBAN GDNS RD"         
## [439] "TECK WHYE AVE"          "TECK WHYE LANE"        
## [441] "TELOK BLANGAH CRES"     "TELOK BLANGAH DR"      
## [443] "TELOK BLANGAH HTS"      "TELOK BLANGAH RISE"    
## [445] "TELOK BLANGAH WAY"      "TESSENSOHN RD"         
## [447] "TG PAGAR PLAZA"         "TIONG BAHRU RD"        
## [449] "TOA PAYOH CTRL"         "TOA PAYOH EAST"        
## [451] "TOA PAYOH NTH"          "TOH GUAN RD"           
## [453] "TOH YI DR"              "TOWNER RD"             
## [455] "UBI AVE 1"              "UPP ALJUNIED LANE"     
## [457] "UPP BOON KENG RD"       "UPP CROSS ST"          
## [459] "UPP SERANGOON RD"       "VEERASAMY RD"          
## [461] "WATERLOO ST"            "WELLINGTON CIRCLE"     
## [463] "WEST COAST DR"          "WEST COAST RD"         
## [465] "WHAMPOA DR"             "WHAMPOA RD"            
## [467] "WHAMPOA STH"            "WHAMPOA WEST"          
## [469] "WOODLANDS AVE 1"        "WOODLANDS AVE 3"       
## [471] "WOODLANDS AVE 4"        "WOODLANDS AVE 5"       
## [473] "WOODLANDS AVE 6"        "WOODLANDS AVE 9"       
## [475] "WOODLANDS CIRCLE"       "WOODLANDS CRES"        
## [477] "WOODLANDS CTR RD"       "WOODLANDS DR 14"       
## [479] "WOODLANDS DR 16"        "WOODLANDS DR 40"       
## [481] "WOODLANDS DR 42"        "WOODLANDS DR 44"       
## [483] "WOODLANDS DR 50"        "WOODLANDS DR 52"       
## [485] "WOODLANDS DR 53"        "WOODLANDS DR 60"       
## [487] "WOODLANDS DR 62"        "WOODLANDS DR 70"       
## [489] "WOODLANDS DR 71"        "WOODLANDS DR 72"       
## [491] "WOODLANDS DR 73"        "WOODLANDS DR 75"       
## [493] "WOODLANDS RING RD"      "WOODLANDS ST 11"       
## [495] "WOODLANDS ST 13"        "WOODLANDS ST 31"       
## [497] "WOODLANDS ST 32"        "WOODLANDS ST 41"       
## [499] "WOODLANDS ST 81"        "WOODLANDS ST 82"       
## [501] "WOODLANDS ST 83"        "YISHUN AVE 11"         
## [503] "YISHUN AVE 2"           "YISHUN AVE 3"          
## [505] "YISHUN AVE 4"           "YISHUN AVE 5"          
## [507] "YISHUN AVE 6"           "YISHUN AVE 7"          
## [509] "YISHUN AVE 9"           "YISHUN CTRL"           
## [511] "YISHUN CTRL 1"          "YISHUN RING RD"        
## [513] "YISHUN ST 11"           "YISHUN ST 20"          
## [515] "YISHUN ST 21"           "YISHUN ST 22"          
## [517] "YISHUN ST 61"           "YISHUN ST 71"          
## [519] "YISHUN ST 72"           "YISHUN ST 81"          
## [521] "YUAN CHING RD"          "YUNG AN RD"            
## [523] "YUNG HO RD"             "YUNG KUANG RD"         
## [525] "YUNG LOH RD"            "YUNG PING RD"          
## [527] "YUNG SHENG RD"          "ZION RD"
```


```r
time_series <- raw[, .(count=.N, min=min(resale_price), max=max(resale_price), median=median(resale_price), mean=mean(resale_price), ci95=sd(resale_price)/sqrt(.N)), .(town, flat_type, month)]
time_series$min <- time_series$median-time_series$min
time_series$max <- time_series$max-time_series$median
time_series$ci95 <- ifelse(time_series$count < 3, 0, qt(0.975,time_series$count-1)*time_series$ci95)
```

```
## Warning in qt(0.975, time_series$count - 1): NaNs produced
```

```r
town <- time_series$town
data_obj <- time_series[,-1,with=FALSE]
data_obj <- split(data_obj,town)
data_obj <- lapply(data_obj, function(df) {
  flat_type <- df$flat_type
  df <- df[,-1,with=FALSE]
  split(df,flat_type)
})
export_obj <- list()
n <- 1
for(town in levels(raw$town)) {
  for(flat_type in levels(raw$flat_type)) {
    export_obj[[n]] <- list(town=town, flat_type=flat_type, time_series=data_obj[[town]][[flat_type]])
    n <- n+1
  }
}
write(toJSON(export_obj,dataframe='columns',auto_unbox=TRUE,digit=0,pretty=TRUE),'plotly.json')
```


```r
x_lab <- levels(raw$month)[seq(1,length(levels(raw$month)),12)]
ggplot_mean <- function(town_name) {
  ggplot(time_series[town==town_name],aes(x=month, y=mean, ymax=mean+ci95, ymin=mean-ci95, color=flat_type)) + geom_pointrange(size=0.3) + scale_x_discrete(breaks=x_lab, labels=substr(x_lab,1,4)) + theme(axis.text.x=element_text(angle=90, hjust=1))
}
ggplot_median <- function(town_name) {
  ggplot(time_series[town==town_name],aes(x=month, y=median, ymax=median+max, ymin=median-min, color=flat_type)) + geom_pointrange(size=0.3) + scale_x_discrete(breaks=x_lab, labels=substr(x_lab,1,4)) + theme(axis.text.x=element_text(angle=90, hjust=1))
}
ggplot_mean('ANG MO KIO')
```

![](hdb_resale_price_files/figure-html/sample_plot-1.png) 

```r
ggplot_median('ANG MO KIO')
```

![](hdb_resale_price_files/figure-html/sample_plot-2.png) 


```r
manipulate(ggplot_mean(town), town=picker(as.list(levels(raw$town))))
manipulate(ggplot_median(town), town=picker(as.list(levels(raw$town))))
```


```r
street_name <- count(raw,c('street_name'))
address <- count(raw,c('street_name','block'))
nrow(street_name)
```

```
## [1] 528
```

```r
nrow(address)
```

```
## [1] 8508
```

```r
write(toJSON(address),'address.json')
```
