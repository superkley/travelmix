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

import cn.keke.travelmix.StringConstants;

public class Instruction {
    private final String    instructionText;
    private final long      distance;
    private final int       idx;
    private final int       duration;
    private final String    distanceText;
    private final int       skyDirection;
    private final Direction direction;
    private final MeanOfTransport mot;

    public Instruction(MeanOfTransport mot, String instructionText, long distance, int idx, int duration, String distanceText, int skyDirection,
            Direction direction) {
        this.mot = mot;
        this.instructionText = instructionText;
        this.distance = distance;
        this.idx = idx;
        this.duration = duration;
        this.distanceText = distanceText;
        this.skyDirection = skyDirection;
        this.direction = direction;
    }

    public String getInstructionText() {
        return this.instructionText;
    }

    public long getDistance() {
        return this.distance;
    }

    public int getIdx() {
        return this.idx;
    }

    public int getDuration() {
        return this.duration;
    }

    public String getDistanceText() {
        return this.distanceText;
    }

    public int getSkyDirection() {
        return this.skyDirection;
    }

    public float getTurnDirection() {
        return this.direction.getAngle();
    }

    public String getEarthDirection() {
        if (this.skyDirection < 25 && this.skyDirection >= 340) {
            return "N";
        } else if (this.skyDirection >= 25 && this.skyDirection < 70) {
            return "NE";
        } else if (this.skyDirection >= 70 && this.skyDirection < 115) {
            return "E";
        } else if (this.skyDirection >= 115 && this.skyDirection < 160) {
            return "SE";
        } else if (this.skyDirection >= 160 && this.skyDirection < 205) {
            return "S";
        } else if (this.skyDirection >= 205 && this.skyDirection < 250) {
            return "SW";
        } else if (this.skyDirection >= 250 && this.skyDirection < 295) {
            return "W";
        } else if (this.skyDirection >= 295 && this.skyDirection < 340) {
            return "NW";
        }
        return StringConstants.EMPTY;
    }

    public String getTurnType() {
        switch (this.direction) {
            case STRAIGHT:
                return "C";
            case LEFT:
                return "TL";
            case RIGHT:
                return "TR";
            case SHARP_LEFT:
                return "TSHL";
            case SHARP_RIGHT:
                return "TSHR";
            case SLIGHT_LEFT:
                return "TSLL";
            case SLIGHT_RIGHT:
                return "TSLR";
            case U_TURN:
                return "TU";
            default:
                return "C";
        }
    }

    public MeanOfTransport getMeanOfTransport() {
        return mot;
    }
}
