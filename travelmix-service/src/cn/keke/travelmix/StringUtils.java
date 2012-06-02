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
package cn.keke.travelmix;

import java.nio.charset.Charset;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;

public class StringUtils {
    private final static Map<String, Charset> CHARSET_CACHE = new HashMap<String, Charset>();

    /**
     * 
     * @param charsetName
     * @return Charset for charsetName or defaultCharset
     */
    public static Charset getCharset(String charsetName) {
        Charset charset = Charset.forName(charsetName);
        CHARSET_CACHE.put(charsetName, charset);
        return charset;
    }

    public static String substringBetween(String str, String open, String close, int startPos) {
        int start = str.indexOf(open, startPos);
        if (start != -1) {
            int end = str.indexOf(close, start + open.length());
            if (end != -1) {
                return str.substring(start + open.length(), end);
            }
        }
        return StringConstants.EMPTY;
    }

    public static Entry<Integer, String> indexedSubstringBetween(String str, String open, String close, int startPos) {
        int end = -1;
        String result = StringConstants.EMPTY;
        int start = str.indexOf(open, startPos);
        if (start != -1) {
            end = str.indexOf(close, start + open.length());
            System.out.println(start + ", " + end);
            if (end != -1) {
                result = str.substring(start + open.length(), end);
            }
        }
        return new SimpleEntry<Integer, String>(Integer.valueOf(end), result);
    }

    public static String lastSubstringBetween(String str, String open, String close, int startPos) {
        int end = str.lastIndexOf(close, startPos);
        if (end != -1) {
            int start = str.lastIndexOf(open, end);
            if (start != -1) {
                return str.substring(start + open.length(), end);
            }
        }
        return StringConstants.EMPTY;
    }

    public static Entry<Integer, String> indexedLastSubstringBetween(String str, String open, String close, int startPos) {
        int start = -1;
        String result = StringConstants.EMPTY;
        int end = str.lastIndexOf(close, startPos);
        if (end != -1) {
            start = str.lastIndexOf(open, end);
            if (start != -1) {
                result = str.substring(start + open.length(), end);
            }
        }
        return new SimpleEntry<Integer, String>(Integer.valueOf(start), result);
    }

    public static boolean isNotEmpty(String query) {
        return query != null && query.length() > 0;
    }

    public static boolean isNullOrEmpty(String query) {
        return query == null || query.length() == 0;
    }

}
