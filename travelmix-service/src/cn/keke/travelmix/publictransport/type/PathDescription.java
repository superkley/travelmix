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

import cn.keke.travelmix.StringUtils;

public class PathDescription {
    private Direction direction;
    private String    street;
    private int       duration;
    private long      distance;
    private int       coordIdxFrom;
    private int       skyDirection;

    public Direction getDirection() {
        return this.direction;
    }

    public void setDirection(String direction) {
        this.direction = Direction.valueOf(direction);
    }

    public String getStreet() {
        return this.street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public int getDuration() {
        return this.duration;
    }

    public void setDuration(String duration) {
        if (StringUtils.isNotEmpty(duration)) {
            this.duration = Integer.parseInt(duration);
        }
    }

    public long getDistance() {
        return this.distance;
    }

    public void setDistance(String distance) {
        if (StringUtils.isNotEmpty(distance)) {
            this.distance = Long.parseLong(distance);
        }
    }

    public int getCoordIdxFrom() {
        return this.coordIdxFrom;
    }

    public void setCoordIdxFrom(String coordIdxFrom) {
        if (StringUtils.isNotEmpty(coordIdxFrom)) {
            this.coordIdxFrom = Integer.parseInt(coordIdxFrom);
        }
    }

    public int getSkyDirection() {
        return this.skyDirection;
    }

    public void setSkyDirection(String skyDirection) {
        if (StringUtils.isNotEmpty(skyDirection)) {
            this.skyDirection = Integer.parseInt(skyDirection);
        }
    }
}
