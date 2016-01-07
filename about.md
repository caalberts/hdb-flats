# About the Project

With Singapore rolling out its [Smart Nation Vision ](https://www.ida.gov.sg/Tech-Scene-News/Smart-Nation-Vision)  and the recent launch of IDA's new [open data portal](https://data.gov.sg/), budding web developers [Albert Salim](https://github.com/caalberts) & [Yong Jun](https://github.com/yongjun21) embarked on building their first data visualization project. This project was a fruitful leaning experience for the two and final product can be described as one perfect marriage between **Web** and **Data**.

In this project, Yong Jun & Albert wanted to work on a public dataset and present the [HDB Resale Flat Prices](https://data.gov.sg/dataset/resale-flat-prices)  in a visually appealing manner to help the public understand the HDB resale market trends. The team wanted to look at the data from 2 perspectives: time and space. With that, the team decided to display the data in 2 forms:

1. A time series chart showing historical price trends
2. A heat map showing the hottest locations for property resale in Singapore.

## Charts Tab
<!-- Build a div replica of the Charts tab here-->

![time_series_avg](/img/Average_Screenshot.png)

![time_series_mmm](/img/MMM_Screenshot.png)

<!-- Use display: inline-block for the two screenshots-->

The **Charts** tab opens a time-series chart of historical resale prices . User can toggle between two modes: **Average** & **Min, Max & Median**. User chooses the **town** and returned chart is a set of time-series broken down by **flat types**.

### Average
Markers represent average transaction price in that month while the error bars represent the uncertainty around this average value based on the number of data points available. To calculate this uncertainty, we used 95% t-confidence interval.

### Min, Max & Median
Markers represent median transaction price while top and bottom error bars connect median price respectively to the highest and lowest transacted prices.

## Maps Tab
<!-- Build a div replica of the Maps tab here-->

![heatmap](/img/Heatmap_Screenshot.png)

The **Maps** tab opens a geographical heat map of resale transactions organized by month. Red spots indicates areas where there's either:

1. a concentration of transactions or
2. existence of data points with higher than average transaction prices.

To select a particular month, either use the drop down or click on the point left and point right buttons on the sides to scroll to previous month or next month.

The heat map is layered over Google map so user can use standard navigation options like pan and pinch-zoom to explore. Clicking on the button at the bottom will re-center the map.
