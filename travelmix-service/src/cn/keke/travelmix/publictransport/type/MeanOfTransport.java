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


public enum MeanOfTransport {
    TRAIN(0, "#cc0000"),
    SUBURBAN_RAILWAY(1, "#ffa100"),
    UNDERGROUND_RAILWAY(2, "#c03000"),
    CITY_RAILWAY(3, "#d52b1e"),
    TRAM(4, "#ff3400"),
    CITY_BUS(5, "#85c58f"),
    COACH(6, "#61aa00"),
    EXPRESS_BUS(7, "#00a557"),
    CABLE_CAR(8, "#76d2b6"),
    SHIP(9, "#f46f1a"),
    DIAL_A_RIDE(10, "#00ae65"),
    OTHER(11, "#000000"),
    PLANE(12, "#3366c9"),
    REGIONAL_TRAIN(13, "#ccaaaa"),
    NATIONAL_TRAIN(14, "#aa9999"),
    INTERNATIONAL_TRAIN(15, "#cc3355"),
    HIGH_SPEED_TRAIN(16, "#ffffff"),
    RAIL_REPLACEMENT_TRANSPORT(17, "#333333"),
    FOOT(100, "#0000ff"),
    TAXI(105, "#0066ff");

    public final int type;
    public final String color;

    MeanOfTransport(int type, String color) {
        this.type = type;
        this.color = color;
    }

    public static MeanOfTransport fromType(int type) {
        for (MeanOfTransport mot : MeanOfTransport.values()) {
            if (mot.type == type) {
                return mot;
            }
        }
        return OTHER;
    }
}
