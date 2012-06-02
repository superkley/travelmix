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

public class LocationPoint {
    private final String     name;
    private final String     shortName;
    private final String     platformName;
    private String     hour;
    private String     minute;
    private String           day;
    private String           month;
    private String           year;
    private final Coordinate coordinate;

    public LocationPoint(String name, String shortName, String platformName, Coordinate coordinate) {
        this.name = name;
        this.coordinate = coordinate;
        this.shortName = shortName;
        this.platformName = platformName;
    }

    public String getName() {
        return this.name;
    }

    public Coordinate getCoordinate() {
        return this.coordinate;
    }

    public String getHour() {
        return hour;
    }

    public int getHourInt() {
        return Integer.parseInt(hour);
    }

    public void setHour(String hour) {
        this.hour = hour;
    }

    public String getMinute() {
        return minute;
    }

    public int getMinuteInt() {
        return Integer.parseInt(minute);
    }

    public void setMinute(String minute) {
        this.minute = minute;
    }

    public String getDay() {
        return day;
    }

    public int getDayInt() {
        return Integer.parseInt(day);
    }

    public void setDay(String day) {
        this.day = day;
    }

    public String getMonth() {
        return month;
    }

    public int getMonthInt() {
        return Integer.parseInt(month);
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public String getYear() {
        return year;
    }

    public int getYearInt() {
        return Integer.parseInt(year);
    }

    public void setYear(String year) {
        this.year = year;
    }

    public boolean hasTime() {
        return StringUtils.isNotEmpty(year) && StringUtils.isNotEmpty(month) &&
               StringUtils.isNotEmpty(day) && StringUtils.isNotEmpty(hour) && StringUtils.isNotEmpty(minute);
    }

    public String getShortName() {
        return shortName;
    }

    public String getPlatformName() {
        return platformName;
    }

}
