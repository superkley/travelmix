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

import java.util.List;

public class RouteResult {
    private final String            startPoint;
    private final String            endPoint;
    private final long              individualTotalDistance;
    private final int               individualTotalDuration;
    private final long              totalDistance;
    private final int               totalDuration;
    private final List<Coordinate>  coordinates;
    private final List<Instruction> instructions;

    public RouteResult(String startPoint, String endPoint, long totalDistance, int totalDuration, long individualTotalDistance, int individualTotalDuration,
            List<Coordinate> coordinates, List<Instruction> instructions) {
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.totalDistance = totalDistance;
        this.totalDuration = totalDuration;
        this.individualTotalDistance = individualTotalDistance;
        this.individualTotalDuration = individualTotalDuration;
        this.coordinates = coordinates;
        this.instructions = instructions;
    }

    public String getStartPoint() {
        return startPoint;
    }

    public String getEndPoint() {
        return endPoint;
    }

    public long getIndividualTotalDistance() {
        return individualTotalDistance;
    }

    public int getIndividualTotalDuration() {
        return individualTotalDuration;
    }

    public List<Coordinate> getCoordinates() {
        return coordinates;
    }

    public List<Instruction> getInstructions() {
        return instructions;
    }

    public long getTotalDistance() {
        return totalDistance;
    }

    public int getTotalDuration() {
        return totalDuration;
    }
}
