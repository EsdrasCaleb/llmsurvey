import React, { useState, useEffect } from 'react';
import {
    Form,
    Radio,
    Button,
    Steps,
    Card,
    Typography,
    Layout,
    message,
    Divider,
    Spin,
    Space
} from 'antd';
import 'antd/dist/reset.css';
import ReactMarkdown from 'react-markdown'; // Importação do renderer de Markdown

const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;
const { Content, Header } = Layout;

// --- DADOS FIXOS E UNIVERSO DE OPÇÕES ---

const SUT_CLASSES = ['AnyWrapperMsgGenerator.Equals', 'Util.VectorEqualsUnordered', 'EWrapperMsgGenerator.tickOptionComputation'];
const SUT_CODES = {'AnyWrapperMsgGenerator.Equals':`
package com.ib.client;

public class AnyWrapperMsgGenerator {
	public static String error(int id, int errorCode, String errorMsg) {
		String err = Integer.toString(id);
        err += " | ";
        err += Integer.toString(errorCode);
        err += " | ";
        err += errorMsg;
        return err;
	}
}`,
    'Util.VectorEqualsUnordered':`
package com.ib.client;

import java.util.Vector;

public class Util {
public static boolean VectorEqualsUnordered(Vector lhs, Vector rhs) {
    	
    	if (lhs == rhs)
    		return true;
    	
    	int lhsCount = lhs == null ? 0 : lhs.size();
    	int rhsCount = rhs == null ? 0 : rhs.size();
    	
    	if (lhsCount != rhsCount)
    		return false;
    	
    	if (lhsCount == 0)
    		return true;
    	
    	boolean[] matchedRhsElems = new boolean[rhsCount];
    	
    	for (int lhsIdx = 0; lhsIdx < lhsCount; ++lhsIdx) {
    		Object lhsElem = lhs.get(lhsIdx);
    		int rhsIdx = 0;
    		for (; rhsIdx < rhsCount; ++rhsIdx) {
    			if (matchedRhsElems[rhsIdx]) {
    				continue;
    			}
    			if (lhsElem.equals(rhs.get(rhsIdx))) {
    				matchedRhsElems[rhsIdx] = true;
    				break;
    			}
    		}
    		if (rhsIdx >= rhsCount) {
    			// no matching elem found
    			return false;
    		}
    	}
    	
    	return true;
    }
}`,
'EWrapperMsgGenerator.tickOptionComputation':`
package com.ib.client;

import java.text.DateFormat;
import java.util.Date;
import java.util.Vector;

public class EWrapperMsgGenerator extends AnyWrapperMsgGenerator {
    static public String tickOptionComputation( int tickerId, int field, double impliedVol,
    		double delta, double modelPrice, double pvDividend) {
    	String toAdd = "id=" + tickerId + "  " + TickType.getField( field) +
		   ": vol = " + ((impliedVol >= 0 && impliedVol != Double.MAX_VALUE) ? Double.toString(impliedVol) : "N/A") +
		   " delta = " + ((Math.abs(delta) <= 1) ? Double.toString(delta) : "N/A");
    	if (field == TickType.MODEL_OPTION) {
    		toAdd += ": modelPrice = " + ((modelPrice >= 0 && modelPrice != Double.MAX_VALUE) ? Double.toString(modelPrice) : "N/A");
    		toAdd += ": pvDividend = " + ((pvDividend >= 0 && pvDividend != Double.MAX_VALUE) ? Double.toString(pvDividend) : "N/A");
    	}
		return toAdd;
    }
}
`
}
// O universo de 6 modelos de teste
const TEST_CODE_UNIVERSE = {
    'GPT4o':{
        "AnyWrapperMsgGenerator.Equals":`
package com.ib.client;

import org.mockito.*;
import org.junit.jupiter.api.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

public class AnyWrapperMsgGenerator_error_2_0_Test {

    @Test
    public void testError_ValidInputs() {
        // Arrange
        int id = 1;
        int errorCode = 404;
        String errorMsg = "Not Found";
        // Act
        String result = AnyWrapperMsgGenerator.error(id, errorCode, errorMsg);
        // Assert
        assertEquals("1 | 404 | Not Found", result);
    }

    @Test
    public void testError_ZeroValues() {
        // Arrange
        int id = 0;
        int errorCode = 0;
        String errorMsg = "No Error";
        // Act
        String result = AnyWrapperMsgGenerator.error(id, errorCode, errorMsg);
        // Assert
        assertEquals("0 | 0 | No Error", result);
    }

    @Test
    public void testError_NegativeValues() {
        // Arrange
        int id = -1;
        int errorCode = -404;
        String errorMsg = "Not Found";
        // Act
        String result = AnyWrapperMsgGenerator.error(id, errorCode, errorMsg);
        // Assert
        assertEquals("-1 | -404 | Not Found", result);
    }

    @Test
    public void testError_EmptyMessage() {
        // Arrange
        int id = 1;
        int errorCode = 500;
        String errorMsg = "";
        // Act
        String result = AnyWrapperMsgGenerator.error(id, errorCode, errorMsg);
        // Assert
        assertEquals("1 | 500 | ", result);
    }

    @Test
    public void testError_NullMessage() {
        // Arrange
        int id = 1;
        int errorCode = 400;
        String errorMsg = null;
        // Act
        String result = AnyWrapperMsgGenerator.error(id, errorCode, errorMsg);
        // Assert
        assertEquals("1 | 400 | null", result);
    }
}`,
        "Util.VectorEqualsUnordered":`
package com.ib.client;

import java.util.Vector;
import org.mockito.*;
import org.junit.jupiter.api.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

public class Util_VectorEqualsUnordered_4_0_Test {

    @Test
    public void testVectorEqualsUnordered_SameReference() {
        Vector<Integer> vector = new Vector<>();
        vector.add(1);
        vector.add(2);
        assertTrue(Util.VectorEqualsUnordered(vector, vector));
    }

    @Test
    public void testVectorEqualsUnordered_NullVectors() {
        assertTrue(Util.VectorEqualsUnordered(null, null));
    }

    @Test
    public void testVectorEqualsUnordered_OneNullVector() {
        Vector<Integer> vector = new Vector<>();
        vector.add(1);
        assertFalse(Util.VectorEqualsUnordered(vector, null));
        assertFalse(Util.VectorEqualsUnordered(null, vector));
    }

    @Test
    public void testVectorEqualsUnordered_DifferentSizes() {
        Vector<Integer> lhs = new Vector<>();
        lhs.add(1);
        Vector<Integer> rhs = new Vector<>();
        rhs.add(1);
        rhs.add(2);
        assertFalse(Util.VectorEqualsUnordered(lhs, rhs));
    }

    @Test
    public void testVectorEqualsUnordered_EmptyVectors() {
        Vector<Integer> lhs = new Vector<>();
        Vector<Integer> rhs = new Vector<>();
        assertTrue(Util.VectorEqualsUnordered(lhs, rhs));
    }

    @Test
    public void testVectorEqualsUnordered_SameElementsDifferentOrder() {
        Vector<Integer> lhs = new Vector<>();
        lhs.add(1);
        lhs.add(2);
        Vector<Integer> rhs = new Vector<>();
        rhs.add(2);
        rhs.add(1);
        assertTrue(Util.VectorEqualsUnordered(lhs, rhs));
    }

    @Test
    public void testVectorEqualsUnordered_DifferentElements() {
        Vector<Integer> lhs = new Vector<>();
        lhs.add(1);
        lhs.add(2);
        Vector<Integer> rhs = new Vector<>();
        rhs.add(2);
        rhs.add(3);
        assertFalse(Util.VectorEqualsUnordered(lhs, rhs));
    }

    @Test
    public void testVectorEqualsUnordered_MatchingWithDuplicates() {
        Vector<Integer> lhs = new Vector<>();
        lhs.add(1);
        lhs.add(1);
        lhs.add(2);
        Vector<Integer> rhs = new Vector<>();
        rhs.add(2);
        rhs.add(1);
        rhs.add(1);
        assertTrue(Util.VectorEqualsUnordered(lhs, rhs));
    }

    @Test
    public void testVectorEqualsUnordered_NoMatchingElement() {
        Vector<Integer> lhs = new Vector<>();
        lhs.add(1);
        lhs.add(2);
        Vector<Integer> rhs = new Vector<>();
        rhs.add(3);
        rhs.add(4);
        assertFalse(Util.VectorEqualsUnordered(lhs, rhs));
    }
}`,
        "EWrapperMsgGenerator.tickOptionComputation":`
`
    },
    'Gemini1.5':{
        "AnyWrapperMsgGenerator.Equals":`
package com.ib.client;

import org.mockito.*;
import org.junit.jupiter.api.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

public class AnyWrapperMsgGenerator_error_2_0_Test {

    @Test
    void testError_normalCase() {
        String expected = "123 | 456 | This is an error message";
        String actual = AnyWrapperMsgGenerator.error(123, 456, "This is an error message");
        assertEquals(expected, actual);
    }

    @Test
    void testError_errorCodeZero() {
        String expected = "1 | 0 | Error";
        String actual = AnyWrapperMsgGenerator.error(1, 0, "Error");
        assertEquals(expected, actual);
    }

    @Test
    void testError_idZero() {
        String expected = "0 | 123 | Another error";
        String actual = AnyWrapperMsgGenerator.error(0, 123, "Another error");
        assertEquals(expected, actual);
    }

    @Test
    void testError_emptyErrorMessage() {
        String expected = "42 | 404 | ";
        String actual = AnyWrapperMsgGenerator.error(42, 404, "");
        assertEquals(expected, actual);
    }

    @Test
    void testError_nullErrorMessage() {
        String expected = "777 | 500 | null";
        String actual = AnyWrapperMsgGenerator.error(777, 500, null);
        assertEquals(expected, actual);
    }

    @Test
    void testError_negativeIdAndErrorCode() {
        String expected = "-1 | -100 | Negative error";
        String actual = AnyWrapperMsgGenerator.error(-1, -100, "Negative error");
        assertEquals(expected, actual);
    }

    @Test
    void testError_largeNumbers() {
        String expected = "2147483647 | 2147483647 | Very large error";
        String actual = AnyWrapperMsgGenerator.error(2147483647, 2147483647, "Very large error");
        assertEquals(expected, actual);
    }
}`,
"Util.VectorEqualsUnordered":`
package com.ib.client;

import java.util.Vector;
import org.mockito.*;
import org.junit.jupiter.api.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

public class Util_VectorEqualsUnordered_4_0_Test {

    @Test
    void testVectorEqualsUnordered_sameVectors() {
        Vector<Integer> v1 = new Vector<>();
        v1.add(1);
        v1.add(2);
        v1.add(3);
        assertTrue(Util.VectorEqualsUnordered(v1, v1));
    }

    @Test
    void testVectorEqualsUnordered_nullVectors() {
        assertTrue(Util.VectorEqualsUnordered(null, null));
    }

    @Test
    void testVectorEqualsUnordered_oneNullVector() {
        Vector<Integer> v1 = new Vector<>();
        v1.add(1);
        v1.add(2);
        assertFalse(Util.VectorEqualsUnordered(v1, null));
        assertFalse(Util.VectorEqualsUnordered(null, v1));
    }

    @Test
    void testVectorEqualsUnordered_emptyVectors() {
        Vector<Integer> v1 = new Vector<>();
        Vector<Integer> v2 = new Vector<>();
        assertTrue(Util.VectorEqualsUnordered(v1, v2));
    }

    @Test
    void testVectorEqualsUnordered_differentSizes() {
        Vector<Integer> v1 = new Vector<>();
        v1.add(1);
        v1.add(2);
        Vector<Integer> v2 = new Vector<>();
        v2.add(1);
        v2.add(2);
        v2.add(3);
        assertFalse(Util.VectorEqualsUnordered(v1, v2));
    }

    @Test
    void testVectorEqualsUnordered_sameElementsDifferentOrder() {
        Vector<Integer> v1 = new Vector<>();
        v1.add(1);
        v1.add(2);
        v1.add(3);
        Vector<Integer> v2 = new Vector<>();
        v2.add(3);
        v2.add(1);
        v2.add(2);
        assertTrue(Util.VectorEqualsUnordered(v1, v2));
    }

    @Test
    void testVectorEqualsUnordered_differentElements() {
        Vector<Integer> v1 = new Vector<>();
        v1.add(1);
        v1.add(2);
        v1.add(3);
        Vector<Integer> v2 = new Vector<>();
        v2.add(3);
        v2.add(1);
        v2.add(4);
        assertFalse(Util.VectorEqualsUnordered(v1, v2));
    }

    @Test
    void testVectorEqualsUnordered_duplicates() {
        Vector<Integer> v1 = new Vector<>();
        v1.add(1);
        v1.add(2);
        v1.add(2);
        Vector<Integer> v2 = new Vector<>();
        v2.add(2);
        v2.add(1);
        v2.add(2);
        assertTrue(Util.VectorEqualsUnordered(v1, v2));
    }

    @Test
    void testVectorEqualsUnordered_differentDuplicates() {
        Vector<Integer> v1 = new Vector<>();
        v1.add(1);
        v1.add(2);
        v1.add(2);
        Vector<Integer> v2 = new Vector<>();
        v2.add(2);
        v2.add(1);
        v2.add(3);
        assertFalse(Util.VectorEqualsUnordered(v1, v2));
    }
}
`,
"EWrapperMsgGenerator.tickOptionComputation":`
`
    },
    'Codestral':{
        "AnyWrapperMsgGenerator.Equals":`
package com.ib.client;

import org.mockito.*;
import org.junit.jupiter.api.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

public class AnyWrapperMsgGenerator_error_2_0_Test {

    @Test
    public void testError() {
        int id = 1;
        int errorCode = 100;
        String errorMsg = "Test error message";
        String expected = "1 | 100 | Test error message";
        String actual = AnyWrapperMsgGenerator.error(id, errorCode, errorMsg);
        assertEquals(expected, actual);
    }

    @Test
    public void testErrorWithZeroId() {
        int id = 0;
        int errorCode = 100;
        String errorMsg = "Test error message";
        String expected = "0 | 100 | Test error message";
        String actual = AnyWrapperMsgGenerator.error(id, errorCode, errorMsg);
        assertEquals(expected, actual);
    }

    @Test
    public void testErrorWithZeroErrorCode() {
        int id = 1;
        int errorCode = 0;
        String errorMsg = "Test error message";
        String expected = "1 | 0 | Test error message";
        String actual = AnyWrapperMsgGenerator.error(id, errorCode, errorMsg);
        assertEquals(expected, actual);
    }

    @Test
    public void testErrorWithEmptyErrorMsg() {
        int id = 1;
        int errorCode = 100;
        String errorMsg = "";
        String expected = "1 | 100 | ";
        String actual = AnyWrapperMsgGenerator.error(id, errorCode, errorMsg);
        assertEquals(expected, actual);
    }

    @Test
    public void testErrorWithNullErrorMsg() {
        int id = 1;
        int errorCode = 100;
        String errorMsg = null;
        String expected = "1 | 100 | null";
        String actual = AnyWrapperMsgGenerator.error(id, errorCode, errorMsg);
        assertEquals(expected, actual);
    }
}`,
        "Util.VectorEqualsUnordered":`
package com.ib.client;

import java.util.Vector;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.*;
import org.junit.jupiter.api.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class Util_VectorEqualsUnordered_4_0_Test {

    @Test
    public void testVectorEqualsUnordered() {
        // Test case 1: Both vectors are null
        assertTrue(Util.VectorEqualsUnordered(null, null));
        // Test case 2: One vector is null, the other is not
        Vector<Integer> lhs = new Vector<>();
        assertFalse(Util.VectorEqualsUnordered(lhs, null));
        assertFalse(Util.VectorEqualsUnordered(null, lhs));
        // Test case 3: Both vectors are empty
        assertTrue(Util.VectorEqualsUnordered(lhs, new Vector<>()));
        // Test case 4: Vectors have different sizes
        lhs.add(1);
        assertFalse(Util.VectorEqualsUnordered(lhs, new Vector<>()));
        // Test case 5: Vectors have the same elements in the same order
        Vector<Integer> rhs = new Vector<>();
        rhs.add(1);
        assertTrue(Util.VectorEqualsUnordered(lhs, rhs));
        // Test case 6: Vectors have the same elements in different orders
        lhs.add(2);
        rhs.add(0, 2);
        assertTrue(Util.VectorEqualsUnordered(lhs, rhs));
        // Test case 7: Vectors have different elements
        rhs.set(1, 3);
        assertFalse(Util.VectorEqualsUnordered(lhs, rhs));
        // Test case 8: Vectors have the same elements but one has duplicates
        lhs.add(2);
        assertFalse(Util.VectorEqualsUnordered(lhs, rhs));
        // Test case 9: Vectors have the same elements but different types
        Vector<Object> objLhs = new Vector<>();
        objLhs.add(1);
        Vector<Object> objRhs = new Vector<>();
        objRhs.add("1");
        assertFalse(Util.VectorEqualsUnordered(objLhs, objRhs));
    }
}
`,
        "EWrapperMsgGenerator.tickOptionComputation":`
`
    },
    'xLam':{
        "AnyWrapperMsgGenerator.Equals":`
package com.ib.client;

import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.*;
import org.junit.jupiter.api.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class AnyWrapperMsgGenerator_error_2_0_Test {

    @Test
    public void testErrorMethod() {
        int id = 123;
        int errorCode = 404;
        String errorMsg = "Not Found";
        String expected = Integer.toString(id) + " | " + Integer.toString(errorCode) + " | " + errorMsg;
        String result = AnyWrapperMsgGenerator.error(id, errorCode, errorMsg);
        assertEquals(expected, result);
    }
}`,
        "Util.VectorEqualsUnordered":`
package com.ib.client;

import org.mockito.*;
import org.junit.jupiter.api.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Vector;

public class Util_VectorEqualsUnordered_4_1_Test {

    @Test
    public void testVectorEqualsUnordered() {
        // Test with equal vectors
        Vector vector1 = new Vector();
        Vector vector2 = new Vector();
        vector1.add(1);
        vector1.add(2);
        vector2.add(1);
        vector2.add(2);
        assertEquals(true, Util.VectorEqualsUnordered(vector1, vector2));
        // Test with unequal vectors
        Vector vector3 = new Vector();
        Vector vector4 = new Vector();
        vector3.add(1);
        vector3.add(2);
        vector4.add(1);
        vector4.add(3);
        assertEquals(false, Util.VectorEqualsUnordered(vector3, vector4));
        // Test with null vectors
        Vector vector5 = null;
        Vector vector6 = new Vector();
        assertEquals(true, Util.VectorEqualsUnordered(vector5, vector6));
        Vector vector7 = new Vector();
        Vector vector8 = null;
        assertEquals(true, Util.VectorEqualsUnordered(vector7, vector8));
        // Test with empty vectors
        Vector vector9 = new Vector();
        Vector vector10 = new Vector();
        assertEquals(true, Util.VectorEqualsUnordered(vector9, vector10));
    }
}
`,
        "EWrapperMsgGenerator.tickOptionComputation":`
`
    },
    'Gemma2':{
        "AnyWrapperMsgGenerator.Equals":`
package com.ib.client;

import org.mockito.*;
import org.junit.jupiter.api.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

public class AnyWrapperMsgGenerator_error_2_3_Test {

    @Test
    void testError() {
        AnyWrapperMsgGenerator.error(1, 400, "Invalid Request");
    }
}`,
        "Util.VectorEqualsUnordered":`
package com.ib.client;

import org.mockito.*;
import org.junit.jupiter.api.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Vector;

public class Util_VectorEqualsUnordered_4_1_Test {

    @Test
    void testVectorEqualsUnordered() {
        Util util = new Util();
        Vector lhs = new Vector();
        lhs.add(1);
        lhs.add(2);
        lhs.add(3);
        Vector rhs = new Vector();
        rhs.add(1);
        rhs.add(2);
        rhs.add(3);
        assertTrue(util.VectorEqualsUnordered(lhs, rhs));
    }
}
`,
        "EWrapperMsgGenerator.tickOptionComputation":`
`
    },
    'DeepseekCoder':{
        "AnyWrapperMsgGenerator.Equals":`
package com.ib.client;

import org.mockito.*;
import org.junit.jupiter.api.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

public class AnyWrapperMsgGenerator_error_2_2_Test {

    @Test
    public void testError() {
        String expected = "123 | 404 | Not Found";
        String result = AnyWrapperMsgGenerator.error(123, 404, "Not Found");
        assertEquals(expected, result);
    }
}`,
        "Util.VectorEqualsUnordered":`
package com.ib.client;

import org.mockito.*;
import org.junit.jupiter.api.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Vector;

public class Util_VectorEqualsUnordered_4_1_Test {

    @Test
    public void testVectorEqualsUnordered() {
        // Test with two null vectors
        assertEquals(true, Util.VectorEqualsUnordered(null, null));
        // Test with two empty vectors
        assertEquals(true, Util.VectorEqualsUnordered(new Vector(), new Vector()));
        // Test with two vectors with different sizes
        Vector v1 = new Vector();
        v1.addElement(new Integer(1));
        v1.addElement(new Integer(2));
        Vector v2 = new Vector();
        v2.addElement(new Integer(1));
        v2.addElement(new Integer(2));
        v2.addElement(new Integer(3));
        assertEquals(false, Util.VectorEqualsUnordered(v1, v2));
        // Test with two vectors with same elements but different order
        Vector v3 = new Vector();
        v3.addElement(new Integer(1));
        v3.addElement(new Integer(2));
        Vector v4 = new Vector();
        v4.addElement(new Integer(2));
        v4.addElement(new Integer(1));
        assertEquals(false, Util.VectorEqualsUnordered(v3, v4));
        // Test with two vectors with same elements
        Vector v5 = new Vector();
        v5.addElement(new Integer(1));
        v5.addElement(new Integer(2));
        Vector v6 = new Vector();
        v6.addElement(new Integer(1));
        v6.addElement(new Integer(2));
        assertEquals(true, Util.VectorEqualsUnordered(v5, v6));
    }
}
`,
        "EWrapperMsgGenerator.tickOptionComputation":`
`
    }
};

const QUESTIONS = [
    { id: 'q1', text: 'Há clareza e a descritividade dos nomes de variáveis e métodos de teste?' },
    { id: 'q2', text: 'O código está estruturado, lógico e formatado?' },
    { id: 'q3', text: 'O método focal foi validado com as asserções feitas?' },
    { id: 'q4', text: 'Os testes podem ser adotados para uso prático?' },
];
const ANSWER_OPTIONS = {
    'q1':[
        {id:1,value:1,text:'A maioria dos nomes são difíceis de entender sem um contexto extenso'},
        {id:2,value:2,text:'Alguns nomes são nomeados intuitivamente e fáceis de entender'},
        {id:3,value:3,text:'A maioria dos nomes é intuitiva e fácil de entender.'}
    ],
    'q2':[
        {id:3,value:3,text:'Código bem estruturado com lógica clara'},
        {id:2,value:2,text:'Estrutura geral razoável com pequenos problemas'},
        {id:1,value:1,text:'Lógica caótica ou código redundante massivo'}
    ],
    'q3':[
        {id:1,value:1,text:'Asserções semanticamente incorretas'},
        {id:2,value:2,text:'Asserções razoáveis, mas fracas'},
        {id:3,value:3,text:'Asserções precisas dentro do contexto do teste'}
    ],
    'q4':[
        {id:1,value:1,text:'São necessários grandes esforços para otimizar'},
        {id:2,value:2,text:'Modificações simples necessárias antes da adoção direta'},
        {id:3,value:3,text:'Nenhum esforço necessário antes da adoção direta'}
    ],

};

// --- FUNÇÃO AUXILIAR ---
const getRandomElements = (arr, n) => {
    return [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
};

// --- COMPONENTE PRINCIPAL ---
const TestQualityForm = () => {
    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedTests, setSelectedTests] = useState(null);
    const [allFormData, setAllFormData] = useState({});

    // LÓGICA DE SELEÇÃO ATUALIZADA
    useEffect(() => {
        const tests = {};
        const allModelNames = Object.keys(TEST_CODE_UNIVERSE); // Pega os nomes de todos os modelos disponíveis

        SUT_CLASSES.forEach(sut => {
            const randomModelNames = getRandomElements(allModelNames, 2); // Sorteia 2 nomes de modelos

            // Para cada nome sorteado, busca o código correspondente e cria um objeto
            tests[sut] = randomModelNames.map(modelName => ({
                modelName: modelName,
                code: TEST_CODE_UNIVERSE[modelName][sut] // Busca o código Java específico
            }));
        });
        setSelectedTests(tests);
    }, []);

    const handleNext = async () => {
        try {
            await form.validateFields();
            const currentValues = form.getFieldsValue();
            setAllFormData(prevData => ({ ...prevData, ...currentValues }));
            setCurrentStep(currentStep + 1);
        } catch (error) {
            message.error('Por favor, responda a todas as perguntas antes de continuar.');
        }
    };

    const handlePrev = () => setCurrentStep(currentStep - 1);

    const onFinish = async (values) => {
        try {
            await form.validateFields();
            const finalData = { ...allFormData, ...values };
            console.log('--- DADOS FINAIS DO FORMULÁRIO ---');
            console.log(JSON.stringify(finalData, null, 2));
            message.success('Formulário enviado com sucesso! Obrigado pela sua avaliação.');
        } catch (error) {
            message.error('Por favor, responda a todas as perguntas.');
        }
    };

    if (!selectedTests) {
        return (
            <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spin size="large" />
            </Layout>
        );
    }

    const currentSut = SUT_CLASSES[currentStep];
    const currentCode = SUT_CODES[currentStep];
    const testsForCurrentSut = selectedTests[currentSut];

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            <Header style={{ backgroundColor: 'white', textAlign: 'center' }}>
                <Title level={2} style={{ margin: '14px 0' }}>Formulário de Qualidade de Testes Gerados</Title>
            </Header>
            <Content style={{ padding: '50px', maxWidth: '900px', margin: '0 auto' }}>
                <Card>
                    <Steps current={currentStep} style={{ marginBottom: '40px' }}>
                        {SUT_CLASSES.map(item => <Step key={item} title={item} />)}
                    </Steps>

                    <Title level={3}>Avaliando a Classe: <Text type="success">{currentSut}</Text></Title>
                    <Card title="Código" size="small" style={{ marginBottom: 24, backgroundColor: '#f9f9f9' }}>
                        <ReactMarkdown components={{
                            code({node, inline, className, children, ...props}) {
                                return <code className="language-java" {...props}>{children}</code>
                            }
                        }}>
                            {`\`\`\`java\n${currentCode}\n\`\`\``}
                        </ReactMarkdown>
                    </Card>
                    <Paragraph type="secondary">Avalie os 2 testes gerados aleatoriamente para esta classe SUT.</Paragraph>

                    <Form form={form} layout="vertical" onFinish={onFinish} initialValues={allFormData}>
                        {testsForCurrentSut.map((test, testIndex) => (
                            <div key={`${currentSut}-${test.modelName}`}>
                                <Divider orientation="left">Teste {testIndex + 1}: <Text strong>{test.modelName}</Text></Divider>

                                {/* NOVO: Exibindo o código do teste em um card formatado */}
                                <Card title="Código do Teste para Avaliação" size="small" style={{ marginBottom: 24, backgroundColor: '#f9f9f9' }}>
                                    <ReactMarkdown components={{
                                        code({node, inline, className, children, ...props}) {
                                            return <code className="language-java" {...props}>{children}</code>
                                        }
                                    }}>
                                        {`\`\`\`java\n${test.code}\n\`\`\``}
                                    </ReactMarkdown>
                                </Card>

                                {QUESTIONS.map((question) => (
                                    <Form.Item
                                        key={question.id}
                                        name={[currentSut, test.modelName, question.id]} // O nome do campo usa o nome do modelo
                                        label={question.text}
                                        rules={[{ required: true, message: 'Este campo é obrigatório.' }]}
                                    >
                                        <Radio.Group>
                                            <Space direction="horizontal">
                                                {ANSWER_OPTIONS[question.id].map(option => (
                                                    <Radio key={option.id} value={option.value}>{option.text}</Radio>
                                                ))}
                                            </Space>
                                        </Radio.Group>
                                    </Form.Item>
                                ))}
                            </div>
                        ))}

                        <div style={{ marginTop: '24px', textAlign: 'right' }}>
                            <Space>
                                {currentStep > 0 && <Button onClick={handlePrev}>Anterior</Button>}
                                {currentStep < SUT_CLASSES.length - 1 && <Button type="primary" onClick={handleNext}>Próximo</Button>}
                                {currentStep === SUT_CLASSES.length - 1 && <Button type="primary" htmlType="submit">Finalizar e Enviar</Button>}
                            </Space>
                        </div>
                    </Form>
                </Card>
            </Content>
        </Layout>
    );
};

export default TestQualityForm;