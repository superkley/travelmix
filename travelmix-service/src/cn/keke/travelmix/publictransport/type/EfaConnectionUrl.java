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

import org.apache.log4j.Logger;

public class EfaConnectionUrl {
	private static final Logger LOG = Logger.getLogger(EfaConnectionUrl.class);

	public static final int COORDINATE_LENGTH = 10;
	private final char[] connectionUrl;
	private final int datePos;
	private final int timePos;
	private final int origLatPos;
	private final int origLngPos;
	private final int destLatPos;
	private final int destLngPos;

	/**
	 * inclMOT: <meansElem value="0" selected="0">Zug</meansElem> <meansElem
	 * value="1" selected="0">S-Bahn</meansElem> <meansElem value="2"
	 * selected="0">U-Bahn</meansElem> <meansElem value="3"
	 * selected="0">Stadtbahn</meansElem> <meansElem value="4"
	 * selected="0">Straßen-/Trambahn</meansElem> <meansElem value="5"
	 * selected="0">Stadtbus</meansElem> <meansElem value="6"
	 * selected="0">Regionalbus</meansElem> <meansElem value="7"
	 * selected="0">Schnellbus</meansElem> <meansElem value="8"
	 * selected="0">Seil-/Zahnradbahn</meansElem> <meansElem value="9"
	 * selected="0">Schiff</meansElem> <meansElem value="10"
	 * selected="0">AST/Ruftaxi</meansElem> <meansElem value="11"
	 * selected="0">Sonstige</meansElem> ptOptions: active="1" maxChanges="2"
	 * maxTime="360" maxWait="120" routeType="LEASTTIME" changeSpeed="fast"
	 * lineRestriction="400" useProxFootSearch="0" useProxFootSearchOrigin="0"
	 * useProxFootSearchDestination="0" bike="0" plane="0" noCrowded="0"
	 * noSolidStairs="0" noEscalators="0" noElevators="0" lowPlatformVhcl="0"
	 * wheelchair="0" SOSAvail="0" noLonelyTransfer="0" illumTransfer="0"
	 * overgroundTransfer="0" noInsecurePlaces="0" privateTransport="0"
	 * 
	 * @param providerConnectionUrl
	 */
	public EfaConnectionUrl(String providerConnectionUrl) {
		StringBuffer sb = new StringBuffer(1024);
		sb.append(providerConnectionUrl);
		sb.append("?requestID=0&sessionID=0&type_destination=coord&type_origin=coord&");
		sb.append("useProxFootSearch=1&useRealtime=1&calcNumberOfTrips=1&changeSpeed=fast&trITDepMOTvalue100=15&tryToFindLocalityStops=1&");
		sb.append("maxChanges=2&coordListOutputFormat=STRING&coordOutputFormat=WGS84&");
		sb.append("inclMOT_0=on&inclMOT_1=on&inclMOT_2=on&inclMOT_3=on&inclMOT_4=on&inclMOT_5=on&inclMOT_6=on&inclMOT_7=on&inclMOT_8=on&inclMOT_9=on&inclMOT_10=off&inclMOT_11=on&");
		sb.append("includedMeans=checkbox&itdTripDateTimeDepArr=dep&language=de&");
		sb.append("locationServerActive=1&ptOptionsActive=1&itOptionsActive=1&lineRestriction=403&");
		sb.append("itdDate=");
		this.datePos = sb.length();
		sb.append("yyyyMMdd&itdTime=");
		this.timePos = sb.length();
		sb.append("HHmm&name_origin=");
		this.origLngPos = sb.length();
		sb.append("0.00000000:");
		this.origLatPos = sb.length();
		sb.append("0.00000000:WGS84:ORIGIN_LOCATION&name_destination=");
		this.destLngPos = sb.length();
		sb.append("0.00000000:");
		this.destLatPos = sb.length();
		sb.append("0.00000000:WGS84:DESTINATION_LOCATION");
		this.connectionUrl = sb.toString().toCharArray();
	}

	public synchronized String getConnectionsUrl(String date, String time,
			String origLat, String origLng, String destLat, String destLng) {
		if (LOG.isDebugEnabled()) {
			LOG.debug("date: " + date + ", time: " + time + ", orig: "
					+ origLat + ":" + origLng + ", dest: " + destLat + ":"
					+ destLng);
		}
		System.arraycopy(date.toCharArray(), 0, this.connectionUrl,
				this.datePos, 8);
		System.arraycopy(time.toCharArray(), 0, this.connectionUrl,
				this.timePos, 4);
		System.arraycopy(origLat.toCharArray(), 0, this.connectionUrl,
				this.origLatPos, origLat.length());
		System.arraycopy(origLng.toCharArray(), 0, this.connectionUrl,
				this.origLngPos, origLng.length());
		System.arraycopy(destLat.toCharArray(), 0, this.connectionUrl,
				this.destLatPos, destLat.length());
		System.arraycopy(destLng.toCharArray(), 0, this.connectionUrl,
				this.destLngPos, destLng.length());
		return new String(this.connectionUrl);
	}
}
