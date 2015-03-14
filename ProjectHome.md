## 应用EFA实现在线即时地图导航 ##

（EFA是大部分德国公共交通公司使用的导航时刻表系统）

地图使用cloudemade(内部使用Geoserver+GeoWebCache).（采用openstreetmap地图）

# 公交导航
# 自行车导航
# 步行导航
# 直接地图显示
# 点两下直通结果

## Ajax/JSON-RPC-based realtime on map public transport routing using EFA ##

例图：

1. 德国曼海姆，海德堡，卡鲁（Germany - Mannheim, Heidelberg, Karlsruhe)

![http://travelmix.googlecode.com/files/screen1-ma-ka_small.png](http://travelmix.googlecode.com/files/screen1-ma-ka_small.png)

2. 德国弗莱堡（Germany - Freiburg）

![http://travelmix.googlecode.com/files/screen2-freiburg_small.png](http://travelmix.googlecode.com/files/screen2-freiburg_small.png)

3. 德国曼海姆市中心 （Germany - Mannheim city）

![http://travelmix.googlecode.com/files/screen3-ma_small.png](http://travelmix.googlecode.com/files/screen3-ma_small.png)

4. 奥地利Linz (Austria - Linz)

![http://travelmix.googlecode.com/files/screen4-linz_small.png](http://travelmix.googlecode.com/files/screen4-linz_small.png)

5. 英国伦敦 （UK - London）

![http://travelmix.googlecode.com/files/screen5-london_small.png](http://travelmix.googlecode.com/files/screen5-london_small.png)

6. 瑞士苏黎世 （Switzerland - Zurich）

![http://travelmix.googlecode.com/files/screen6-zurich_small.png](http://travelmix.googlecode.com/files/screen6-zurich_small.png)


## Demo安装&使用方法 ##

**打开travelmix-service.exe （或java -jar travalmix-service.jar）**

**用浏览器打开travelmix-app里的index.html文件**

注：travelmix-service初始端口为9080，电脑必须连接网络

## 结构演示 ##

![http://travelmix.googlecode.com/files/architecture.png](http://travelmix.googlecode.com/files/architecture.png)

## 下载 ##

**travelmix后台服务Windows: http://travelmix.googlecode.com/files/travelmix-service-1.0.exe**

**travelmix后台服务Java Jar（与windows版相同）: http://travelmix.googlecode.com/files/travelmix-service-1.0.jar**

