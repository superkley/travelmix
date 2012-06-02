/*  Copyright (c) 2010 Xiaoyun Zhu
 * 
 *  Permission is hereby granted, free of charge, to any person obtaining a copy  
 *  of this software and associated documentation files (the "Software"), to deal  
 *  in the Software without restriction, including without limitation the rights  
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell  
 *  copies of the Software, and to permit persons to whom the Software is  
 *  furnished to do so, subject to the following conditions:
 *  
 *  The above copyright notice and this permission notice shall be included in  
 *  all copies or substantial portions of the Software.
 *  
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE  
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER  
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN  
 *  THE SOFTWARE.  
 */
package cn.keke.travelmix.publictransport.type;

import java.util.Collections;
import java.util.LinkedList;
import java.util.List;

import cn.keke.travelmix.StringUtils;

public class PartialRoute {
    private TransportType         type;
    private MeanOfTransport       mot;
    private String                transportName;
    private String                transportDestination;
    private LocationPoint         originLocation;
    private LocationPoint         destinationLocation;
    private int                   timeMinute;
    private long                  distance;
    private List<Coordinate>      coordinates;
    private List<PathDescription> descriptions;

    public TransportType getType() {
        return this.type;
    }

    public void setType(String type) {
        this.type = TransportType.valueOf(type);
    }

    public int getTimeMinute() {
        return this.timeMinute;
    }

    public void setTimeMinute(String timeMinute) {
        this.timeMinute = Integer.parseInt(timeMinute);
    }

    public long getDistance() {
        return this.distance;
    }

    public void setDistance(String distance) {
        if (StringUtils.isNotEmpty(distance)) {
            this.distance = Long.parseLong(distance);
        }
    }

    public List<Coordinate> getCoordinates() {
        if (this.coordinates == null) {
            this.coordinates = Collections.emptyList();
        }
        return this.coordinates;
    }

    public void setCoordinates(String coordinatesString) {
        int last = 0;
        int i = 0;
        int j = 0;
        List<Coordinate> coords = new LinkedList<Coordinate>();
        // e.g. 8477293,49496560 8477335,49496497
        while ((i = coordinatesString.indexOf(',', last)) != -1) {
            if ((j = coordinatesString.indexOf(' ', last)) == -1) {
                j = coordinatesString.length();
            }
            float lng = Float.parseFloat(coordinatesString.substring(last, i)) / 1000000f;
            float lat = Float.parseFloat(coordinatesString.substring(i + 1, j)) / 1000000f;
            coords.add(new Coordinate(lng, lat));
            last = j + 1;
        }
        this.coordinates = coords;
    }

    public List<PathDescription> getDescriptions() {
        if (this.descriptions == null) {
            this.descriptions = Collections.emptyList();
        }
        return this.descriptions;
    }

    public void setDescriptions(List<PathDescription> descriptions) {
        this.descriptions = descriptions;
    }

    public LocationPoint getDestinationLocation() {
        return destinationLocation;
    }

    public void setDestinationLocation(LocationPoint destinationLocation) {
        this.destinationLocation = destinationLocation;
    }

    public void setOriginLocation(LocationPoint originLocation) {
        this.originLocation = originLocation;
    }

    public LocationPoint getOriginLocation() {
        return originLocation;
    }

    public void setTransportName(String transportName) {
        this.transportName = transportName;
    }

    public String getTransportName() {
        return transportName;
    }

    public void setMot(int motType) {
        this.mot = MeanOfTransport.fromType(motType);
    }

    public void setMot(MeanOfTransport mot) {
        this.mot = mot;
    }

    public MeanOfTransport getMot() {
        return mot;
    }

    public void setTransportDestination(String transportDestination) {
        this.transportDestination = transportDestination;
    }

    public String getTransportDestination() {
        return transportDestination;
    }

}
