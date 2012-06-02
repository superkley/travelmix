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

import java.io.BufferedInputStream;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.LinkedList;
import java.util.List;
import java.util.Map.Entry;
import java.util.concurrent.TimeUnit;
import java.util.zip.GZIPInputStream;

import cn.keke.travelmix.GeoUtils;
import cn.keke.travelmix.HttpResponseHandler;
import cn.keke.travelmix.IOUtils;
import cn.keke.travelmix.SimpleEntry;
import cn.keke.travelmix.StringConstants;
import cn.keke.travelmix.StringUtils;
import cn.keke.travelmix.publictransport.RoutingJob;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.log4j.Logger;

public class EfaConnectionResponseHandler implements HttpResponseHandler {
	private static final Charset CHARSET_ISO_8859_1 = Charset
			.forName("iso-8859-1");
	private static final float COORDINATE_TO_FLOAT = 1000000f;
	private static final Logger LOG = Logger
			.getLogger(EfaConnectionResponseHandler.class);
	private final boolean zipped;
	private final StringBuffer sb;
	private final String url;
	private final RoutingJob job;

	public EfaConnectionResponseHandler(String url, boolean zipped,
			StringBuffer sb, RoutingJob job) {
		this.sb = sb;
		this.url = url;
		this.zipped = zipped;
		this.job = job;
	}

	public void handle(HttpResponse response) throws IOException {
		if (this.job.isFinished()) {
			return;
		}
		HttpEntity entity = response.getEntity();
		BufferedInputStream in;
		if (this.zipped) {
			in = new BufferedInputStream(new GZIPInputStream(
					entity.getContent()));
		} else {
			in = new BufferedInputStream(entity.getContent());
		}

		String responseText = IOUtils.toString(in, CHARSET_ISO_8859_1);
		if (this.job.isFinished()) {
			return;
		}
		// LOG.info("PT response: " + responseText);
		LinkedList<PartialRoute> partialRoutes = parseExternalRouteResponse(responseText);
		if (!partialRoutes.isEmpty()) {
			LOG.info("Got " + partialRoutes.size() + " partial routes");
			if (!this.job.setFinished(this.url)) {
				return;
			}
			RouteResult result = readRouteInfo(partialRoutes);
			createRouteResponse(this.sb, result);
			this.job.setHandled();
		} else {
			LOG.info("No partial routes received: " + url);
		}
	}

	public void createRouteResponse(StringBuffer sb, RouteResult result) {
		sb.append("{\"version\":0.3,\"status\":0,\"route_summary\":{");
		sb.append("\"total_distance\":").append(result.getTotalDistance())
				.append(',');
		sb.append("\"total_time\":").append(result.getTotalDuration())
				.append(',');
		sb.append("\"total_it_distance\":")
				.append(result.getIndividualTotalDistance()).append(',');
		sb.append("\"total_it_time\":")
				.append(result.getIndividualTotalDuration()).append(',');
		sb.append("\"start_point\":\"").append(result.getStartPoint())
				.append("\",");
		sb.append("\"end_point\":\"").append(result.getEndPoint()).append("\"");
		sb.append("},\"route_geometry\":[");
		boolean first = true;
		for (Coordinate coord : result.getCoordinates()) {
			if (!first) {
				sb.append(',');
			} else {
				first = false;
			}
			sb.append('[').append(coord.getLatitude()).append(',')
					.append(coord.getLongitude()).append(']');
		}
		sb.append("],\"route_instructions\":[");
		first = true;
		for (Instruction inst : result.getInstructions()) {
			if (!first) {
				sb.append(',');
			} else {
				first = false;
			}
			sb.append("[\"").append(inst.getInstructionText()).append("\",")
					.append(inst.getDistance()).append(',')
					.append(inst.getIdx()).append(',')
					.append(inst.getDuration()).append(",\"")
					.append(inst.getDistanceText()).append("\",\"")
					.append(inst.getEarthDirection()).append("\",")
					.append(inst.getSkyDirection()).append(",\"")
					.append(inst.getTurnType()).append("\",")
					.append(inst.getTurnDirection()).append(",\"")
					.append(inst.getMeanOfTransport().color).append("\"]");
		}
		sb.append("]}");
	}

	public RouteResult readRouteInfo(LinkedList<PartialRoute> partialRoutes) {
		String startPoint = partialRoutes.getFirst().getOriginLocation()
				.getName();
		String endPoint = partialRoutes.getLast().getDestinationLocation()
				.getName();
		long individualTotalDistance = 0;
		int individualTotalTimeMinute = 0;
		List<Coordinate> coordinates = new LinkedList<Coordinate>();
		List<Instruction> instructions = new LinkedList<Instruction>();
		for (PartialRoute partialRoute : partialRoutes) {
			if (partialRoute.getType() == TransportType.IT) {
				individualTotalTimeMinute += partialRoute.getTimeMinute();
				individualTotalDistance += partialRoute.getDistance();
			}
			LocationPoint originLocation = partialRoute.getOriginLocation();
			coordinates.add(originLocation.getCoordinate());
			int idx = coordinates.size() - 1;
			Instruction instruction = createOriginLocationInstruction(
					partialRoute, originLocation, idx);
			instructions.add(instruction);
			if (partialRoute.getType() == TransportType.IT) {
				for (PathDescription description : partialRoute
						.getDescriptions()) {
					instruction = new Instruction(partialRoute.getMot(),
							createInstruction(description.getDirection(),
									description.getStreet()),
							description.getDistance(),
							description.getCoordIdxFrom() + idx,
							description.getDuration(),
							createDistanceText(description.getDistance()),
							description.getSkyDirection(),
							description.getDirection());
					instructions.add(instruction);
					// System.out.println(instruction.getInstructionText());
				}
			}
			coordinates.addAll(partialRoute.getCoordinates());
			LocationPoint destinationLocation = partialRoute
					.getDestinationLocation();
			coordinates.add(destinationLocation.getCoordinate());
			idx = coordinates.size() - 1;
			instruction = createDestinationLocationInstruction(partialRoute,
					destinationLocation, idx);
			instructions.add(instruction);
		}
		long totalDistance = getTotalDistance(coordinates);
		int totalTimeMinute = getLocationMinutesDiff(partialRoutes.getFirst()
				.getOriginLocation(), partialRoutes.getLast()
				.getDestinationLocation());
		RouteResult result = new RouteResult(startPoint, endPoint,
				totalDistance, totalTimeMinute * 60, individualTotalDistance,
				individualTotalTimeMinute * 60, coordinates, instructions);
		return result;
	}

	private long getTotalDistance(List<Coordinate> coordinates) {
		long totalDistance = 0;
		Coordinate lastCoord = null;
		for (Coordinate c : coordinates) {
			if (lastCoord == null) {
				lastCoord = c;
			} else {
				totalDistance += GeoUtils.computeDistance(
						lastCoord.getLatitude(), lastCoord.getLongitude(),
						c.getLatitude(), c.getLongitude());
				lastCoord = c;
			}
		}
		return totalDistance;
	}

	/**
	 * approximated minutes diff of two locations
	 * 
	 * @param loc1
	 * @param loc2
	 * @return
	 */
	private int getLocationMinutesDiff(LocationPoint loc1, LocationPoint loc2) {
		if (loc1.hasTime() && loc2.hasTime()) {
			return (int) (TimeUnit.DAYS.toMinutes((loc2.getYearInt() - loc1
					.getYearInt()) * 365)
					+ TimeUnit.DAYS.toMinutes((loc2.getMonthInt() - loc1
							.getMonthInt()) * 30)
					+ TimeUnit.DAYS.toMinutes(loc2.getDayInt()
							- loc1.getDayInt())
					+ TimeUnit.HOURS.toMinutes(loc2.getHourInt()
							- loc1.getHourInt()) + loc2.getMinuteInt() - loc1
						.getMinuteInt());

		}
		return 0;
	}

	private Instruction createOriginLocationInstruction(
			PartialRoute partialRoute, LocationPoint location, int idx) {
		String instructionText;
		String meanOfTransportName = getMeanOfTransportName(partialRoute
				.getMot());
		if (partialRoute.getType() == TransportType.IT) {
			String locationName = location.getName().replace(" Start",
					StringConstants.EMPTY);
			instructionText = location.getMonth() + "月" + location.getDay()
					+ "日 " + location.getHour() + "点" + location.getMinute()
					+ "分：<b>" + meanOfTransportName + "</b>从<b>" + locationName
					+ "</b>出发";
		} else {
			String locationName;
			System.out.println("Location: " + location.getShortName() + ", "
					+ location.getPlatformName());
			if (StringUtils.isNotEmpty(location.getShortName())) {
				locationName = location.getShortName() + StringConstants.SPACE
						+ location.getPlatformName();
			} else {
				locationName = location.getName();
			}
			instructionText = location.getMonth() + "月" + location.getDay()
					+ "日 " + location.getHour() + "点" + location.getMinute()
					+ "分：在<b>" + locationName + "</b>站台上<b>"
					+ meanOfTransportName + partialRoute.getTransportName()
					+ "</b>";
			if (StringUtils.isNotEmpty(partialRoute.getTransportDestination())) {
				instructionText += "（目的地："
						+ partialRoute.getTransportDestination() + "）";
			}
		}
		long distance = 0;
		int duration = 0;
		String distanceText = StringConstants.EMPTY;
		int skyDirection = 0;
		Direction direction = Direction.STRAIGHT;
		return new Instruction(partialRoute.getMot(), instructionText,
				distance, idx, duration, distanceText, skyDirection, direction);
	}

	private String getMeanOfTransportName(MeanOfTransport mot) {
		if (mot == null) {
			return StringConstants.EMPTY;
		}
		switch (mot) {
		case CABLE_CAR:
			return "缆车";
		case CITY_BUS:
			return "公共汽车";
		case CITY_RAILWAY:
			return "市区列车";
		case COACH:
			return "长途大巴";
		case DIAL_A_RIDE:
			return "传呼巴士";
		case EXPRESS_BUS:
			return "快车";
		case FOOT:
			return "步行";
		case HIGH_SPEED_TRAIN:
			return "特快列车";
		case INTERNATIONAL_TRAIN:
			return "国际列车";
		case NATIONAL_TRAIN:
			return "城际列车";
		case OTHER:
			return "其它";
		case PLANE:
			return "客机";
		case RAIL_REPLACEMENT_TRANSPORT:
			return "电车替代";
		case REGIONAL_TRAIN:
			return "地区列车";
		case SHIP:
			return "客船";
		case SUBURBAN_RAILWAY:
			return "轻轨";
		case TRAIN:
			return "火车";
		case TRAM:
			return "有轨电车";
		case UNDERGROUND_RAILWAY:
			return "地铁";
		case TAXI:
			return "出租车";
		default:
			return "其它";
		}
	}

	private Instruction createDestinationLocationInstruction(
			PartialRoute partialRoute, LocationPoint location, int idx) {
		String locationName = location.getName().replace(" Start",
				StringConstants.EMPTY);
		String instructionText;
		String meanOfTransportName = getMeanOfTransportName(partialRoute
				.getMot());
		if (partialRoute.getType() == TransportType.IT) {
			instructionText = location.getMonth() + "月" + location.getDay()
					+ "日 " + location.getHour() + "点" + location.getMinute()
					+ "分：<b>步行</b>抵达<b>" + locationName + "</b>";
		} else {
			instructionText = location.getMonth() + "月" + location.getDay()
					+ "日 " + location.getHour() + "点" + location.getMinute()
					+ "分：<b>" + meanOfTransportName
					+ partialRoute.getTransportName() + "</b>：在<b>"
					+ locationName + "</b>下车";
		}
		long distance = 0;
		int duration = 0;
		String distanceText = StringConstants.EMPTY;
		int skyDirection = 0;
		Direction direction = Direction.STRAIGHT;
		return new Instruction(partialRoute.getMot(), instructionText,
				distance, idx, duration, distanceText, skyDirection, direction);
	}

	public LinkedList<PartialRoute> parseExternalRouteResponse(
			String responseText) throws IOException {
		String routeText = StringUtils.substringBetween(responseText,
				"<itdPartialRouteList>", "</itdPartialRouteList>", 4000);
		List<String> partialRouteTexts = new LinkedList<String>();
		Entry<Integer, String> substringEntry;
		int startPos = 0;
		while (startPos >= 0) {
			substringEntry = StringUtils.indexedSubstringBetween(routeText,
					"<itdPartialRoute", "</itdPartialRoute>", startPos);
			startPos = substringEntry.getKey().intValue();
			if (startPos != -1) {
				partialRouteTexts.add(substringEntry.getValue());
			}
		}
		LinkedList<PartialRoute> partialRoutes = new LinkedList<PartialRoute>();
		for (String prText : partialRouteTexts) {
			PartialRoute partialRoute = new PartialRoute();
			Entry<Integer, LocationPoint> locationPointEntry = createLocationPointEntry(
					prText, 0);
			partialRoute.setOriginLocation(locationPointEntry.getValue());

			locationPointEntry = createLocationPointEntry(prText,
					locationPointEntry.getKey().intValue());
			partialRoute.setDestinationLocation(locationPointEntry.getValue());

			String meanOfTransportText = StringUtils.substringBetween(prText,
					"<itdMeansOfTransport ", ">", locationPointEntry.getKey()
							.intValue());
			partialRoute.setTransportName(StringUtils.substringBetween(
					meanOfTransportText, "shortname=\"", "\"", 10));
			if (StringUtils.isNullOrEmpty(partialRoute.getTransportName())) {
				partialRoute.setTransportName(StringUtils.substringBetween(
						meanOfTransportText, "name=\"", "\"", 10));
			}
			String motTypeString = StringUtils.substringBetween(
					meanOfTransportText, "type=\"", "\"", 20);
			if (StringUtils.isNotEmpty(motTypeString)) {
				partialRoute.setMot(Integer.parseInt(motTypeString));
			}
			partialRoute.setTransportDestination(StringUtils.substringBetween(
					meanOfTransportText, "destination=\"", "\"", 30));
			// e.g. 8477293,49496560 8477335,49496497
			partialRoute.setCoordinates(StringUtils.lastSubstringBetween(
					prText, ">", "</itdCoordinateString>", prText.length()));
			partialRoute.setDistance(StringUtils.substringBetween(prText,
					"distance=\"", "\"", 20));
			partialRoute.setTimeMinute(StringUtils.substringBetween(prText,
					"timeMinute=\"", "\"", 10));
			// e.g. IT, PT
			partialRoute.setType(StringUtils.substringBetween(prText,
					"type=\"", "\"", 0));
			List<PathDescription> descriptions = new LinkedList<PathDescription>();
			startPos = 2000;
			while (startPos >= 0) {
				substringEntry = StringUtils.indexedSubstringBetween(prText,
						"<itdITPathDescriptionElem",
						"</itdITPathDescriptionElem>", startPos);
				startPos = substringEntry.getKey().intValue();
				if (startPos != -1) {
					String descriptionText = substringEntry.getValue();
					PathDescription description = new PathDescription();
					description.setCoordIdxFrom(StringUtils.substringBetween(
							descriptionText, "<fromPathCoordIdx>",
							"</fromPathCoordIdx>", 200));
					// e.g. STRAIGHT
					description.setDirection(StringUtils.substringBetween(
							descriptionText, "<turnDirection>",
							"</turnDirection>", 0));
					description.setDistance(StringUtils.substringBetween(
							descriptionText, "<distance>", "</distance>", 350));
					description.setDuration(StringUtils.substringBetween(
							descriptionText, "<traveltime>", "</traveltime>",
							300));
					description.setSkyDirection(StringUtils.substringBetween(
							descriptionText, "<skyDirection>",
							"</skyDirection>", 250));
					description.setStreet(StringUtils.substringBetween(
							descriptionText, "<streetname>", "</streetname>",
							100));
					descriptions.add(description);
				}
			}
			partialRoute.setDescriptions(descriptions);
			partialRoutes.add(partialRoute);
		}
		return partialRoutes;
	}

	private Entry<Integer, LocationPoint> createLocationPointEntry(
			String prText, int startIdx) {
		Entry<Integer, String> substringEntry = StringUtils
				.indexedSubstringBetween(prText, "<itdPoint", "mapName=",
						startIdx);
		String pointString = substringEntry.getValue();
		LocationPoint point = createLocationPoint(pointString);
		substringEntry = StringUtils.indexedSubstringBetween(prText, "year=\"",
				"\"", substringEntry.getKey().intValue());
		point.setYear(substringEntry.getValue());
		substringEntry = StringUtils.indexedSubstringBetween(prText,
				"month=\"", "\"", substringEntry.getKey().intValue());
		point.setMonth(substringEntry.getValue());
		substringEntry = StringUtils.indexedSubstringBetween(prText, "day=\"",
				"\"", substringEntry.getKey().intValue());
		point.setDay(substringEntry.getValue());
		substringEntry = StringUtils.indexedSubstringBetween(prText, "hour=\"",
				"\"", substringEntry.getKey().intValue());
		point.setHour(substringEntry.getValue());
		substringEntry = StringUtils.indexedSubstringBetween(prText,
				"minute=\"", "\"", substringEntry.getKey().intValue());
		point.setMinute(substringEntry.getValue());
		return new SimpleEntry<Integer, LocationPoint>(substringEntry.getKey(),
				point);
	}

	private String createDistanceText(long distance) {
		if (distance < 1000) {
			return distance + "米";
		} else {
			return (distance / 1000f) + "公里";
		}
	}

	private String createInstruction(Direction direction, String street) {
		String dir;
		String op;
		switch (direction) {
		case STRAIGHT:
			dir = "直走";
			op = "沿";
			break;
		case SHARP_LEFT:
			dir = "左转弯";
			op = "在";
			break;
		case RIGHT:
			dir = "右转";
			op = "在";
			break;
		case LEFT:
			dir = "左转";
			op = "在";
			break;
		case SLIGHT_LEFT:
			dir = "左转";
			op = "沿";
			break;
		case SLIGHT_RIGHT:
			dir = "右转";
			op = "沿";
			break;
		case SHARP_RIGHT:
			dir = "右转弯";
			op = "在";
			break;
		default:
			op = "到达";
			dir = StringConstants.EMPTY;
		}
		if (StringUtils.isNotEmpty(street)) {
			return op + street + dir;
		} else {
			return dir;
		}

	}

	private LocationPoint createLocationPoint(String origPoint) {
		String pointName = StringUtils.substringBetween(origPoint, "name=\"",
				"\"", 20);
		String shortName = StringUtils.substringBetween(origPoint, "nameWO=\"",
				"\"", 20);
		String platformName = StringUtils.substringBetween(origPoint,
				"platformName=\"", "\"", 20);
		pointName = pointName
				.replace(" ORIGIN_LOCATION", StringConstants.EMPTY).replace(
						" DESTINATION_LOCATION", StringConstants.EMPTY);
		float pointLng = Float.parseFloat(StringUtils.substringBetween(
				origPoint, "x=\"", "\"", 80)) / COORDINATE_TO_FLOAT;
		float pointLat = Float.parseFloat(StringUtils.substringBetween(
				origPoint, "y=\"", "\"", 80)) / COORDINATE_TO_FLOAT;
		LocationPoint point = new LocationPoint(pointName, shortName,
				platformName, new Coordinate(pointLng, pointLat));
		return point;
	}
}
