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
    InputNumber,
    Spin,
    Space,
    Result
} from 'antd';
import 'antd/dist/reset.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark-dimmed.min.css";
import { useTranslation } from 'react-i18next';

const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;
const { Content, Header } = Layout;

// --- DADOS FIXOS E UNIVERSO DE OPÇÕES ---
/*
Colocar o local para por o numero da matricula e usar isso para os llms, olhar lista de presença
 */

const SUT_CLASSES = ['AnyWrapperMsgGenerator.error', 'Util.VectorEqualsUnordered'/*, 'EWrapperMsgGenerator.tickOptionComputation'*/];
const SUT_CODES = {'AnyWrapperMsgGenerator.error':`
package com.ib.client;

public class AnyWrapperMsgGenerator {
/*
O método error(int id, int errorCode, String errorMsg) na classe AnyWrapperMsgGenerator:
Aceita:
id: Um identificador inteiro (provavelmente para a origem ou contexto do erro).
errorCode: Um inteiro que representa um código de erro específico.
errorMsg: Uma string contendo uma mensagem de erro descritiva.
Faz:
Concatena o id, o errorCode e o errorMsg em uma única string formatada, separada por " | ".
Retorna:
Uma string no formato: "id | errorCode | errorMsg". Provavelmente, destina-se a fins de registro, relatório de erros ou exibição.
*/
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

/***
O método VectorEqualsUnordered(Vector lhs, Vector rhs) na classe Util:
Aceita:
lhs: Um objeto Vector (o vetor do lado esquerdo a ser comparado).
rhs: Um objeto Vector (o vetor do lado direito a ser comparado).
Executa:
Verifica se os dois vetores contêm os mesmos elementos, ignorando a ordem dos elementos. Garante que cada elemento em lhs tenha um elemento correspondente em rhs e vice-versa.
Retorna:
true se os vetores forem iguais em conteúdo (não ordenados), false caso contrário.
***/
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
        "AnyWrapperMsgGenerator.error":`
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
`,
        "Util.VectorEqualsUnordered":`
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
`,
        "EWrapperMsgGenerator.tickOptionComputation":`
`
    },
    'Gemini1.5':{
        "AnyWrapperMsgGenerator.error":`
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
`,
"Util.VectorEqualsUnordered":`
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
`,
"EWrapperMsgGenerator.tickOptionComputation":`
`
    },
    'Codestral':{
        "AnyWrapperMsgGenerator.error":`
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
`,
        "Util.VectorEqualsUnordered":`
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
`,
        "EWrapperMsgGenerator.tickOptionComputation":`
`
    },
    'xLam':{
        "AnyWrapperMsgGenerator.error":`
@Test
public void testErrorMethod() {
    int id = 123;
    int errorCode = 404;
    String errorMsg = "Not Found";
    String expected = Integer.toString(id) + " | " + Integer.toString(errorCode) + " | " + errorMsg;
    String result = AnyWrapperMsgGenerator.error(id, errorCode, errorMsg);
    assertEquals(expected, result);
}
`,
        "Util.VectorEqualsUnordered":`
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
`,
        "EWrapperMsgGenerator.tickOptionComputation":`
`
    },
    'Gemma2':{
        "AnyWrapperMsgGenerator.error":`
@Test
void testError() {
    AnyWrapperMsgGenerator.error(1, 400, "Invalid Request");
}
`,
        "Util.VectorEqualsUnordered":`
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
`,
        "EWrapperMsgGenerator.tickOptionComputation":`
`
    },
    'DeepseekCoder':{
        "AnyWrapperMsgGenerator.error":`
@Test
public void testError() {
    String expected = "123 | 404 | Not Found";
    String result = AnyWrapperMsgGenerator.error(123, 404, "Not Found");
    assertEquals(expected, result);
}
`,
        "Util.VectorEqualsUnordered":`
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
`,
        "EWrapperMsgGenerator.tickOptionComputation":`
@Test
public void testTickOptionComputation() {
    // Arrange
    int tickerId = 123;
    int field = 4;
    double impliedVol = 0.3;
    double delta = 0.4;
    double modelPrice = 0.5;
    double pvDividend = 0.6;
    String expected = "id=123  TICK: vol = 0.3 delta = 0.4: modelPrice = 0.5: pvDividend = 0.6";
    // Act
    String result = EWrapperMsgGenerator.tickOptionComputation(tickerId, field, impliedVol, delta, modelPrice, pvDividend);
    // Assert
    assertEquals(expected, result);
}
`
    },
    'EvoSuite':{
        "AnyWrapperMsgGenerator.error":`
@Test
public void test3()  throws Throwable  {
  String string0 = AnyWrapperMsgGenerator.error(0, 0, "UffG}");
  assertEquals("0 | 0 | UffG}", string0);
  assertNotNull(string0);
}
`,
        'Util.VectorEqualsUnordered':`
@Test
public void test7()  throws Throwable  {
  Vector<Object> vector0 = new Vector<Object>();
  Vector<Integer> vector1 = new Vector<Integer>();
  vector0.add((Object) "[]");
  boolean boolean0 = Util.VectorEqualsUnordered(vector0, vector1);
  assertEquals(false, boolean0);
}

@Test
public void test8()  throws Throwable  {
  Vector<Integer> vector0 = new Vector<Integer>();
  boolean boolean0 = Util.VectorEqualsUnordered((Vector) null, vector0);
  assertEquals(true, boolean0);
}

@Test
public void test9()  throws Throwable  {
  Vector<Integer> vector0 = new Vector<Integer>();
  boolean boolean0 = Util.VectorEqualsUnordered(vector0, (Vector) null);
  assertEquals(true, boolean0);
}

@Test
public void test10()  throws Throwable  {
  Vector<Object> vector0 = new Vector<Object>();
  Vector<Integer> vector1 = new Vector<Integer>();
  vector0.add((Object) "[]");
  vector1.add((Integer) 0);
  boolean boolean0 = Util.VectorEqualsUnordered(vector0, vector1);
  assertEquals(false, boolean0);
}

@Test
public void test11()  throws Throwable  {
  Vector<String> vector0 = new Vector<String>();
  vector0.add("");
  vector0.add("");
  Vector<String> vector1 = new Vector<String>((Collection<? extends String>) vector0);
  boolean boolean0 = Util.VectorEqualsUnordered(vector1, vector0);
  assertEquals(true, boolean0);
}
`
    }
};

const QUESTIONS = [
    { id: 'q1', key: 'questions.q1' },
    { id: 'q2', key: 'questions.q2' },
    { id: 'q3', key: 'questions.q3' },
    { id: 'q4', key: 'questions.q4' },
];

const ANSWER_OPTIONS = {
    'q1': [
        { id: 1, value: 1, key: 'options.q1.1' },
        { id: 2, value: 2, key: 'options.q1.2' },
        { id: 3, value: 3, key: 'options.q1.3' }
    ],
    'q2': [
        { id: 3, value: 3, key: 'options.q2.3' },
        { id: 2, value: 2, key: 'options.q2.2' },
        { id: 1, value: 1, key: 'options.q2.1' }
    ],
    'q3': [
        { id: 1, value: 1, key: 'options.q3.1' },
        { id: 2, value: 2, key: 'options.q3.2' },
        { id: 3, value: 3, key: 'options.q3.3' }
    ],
    'q4': [
        { id: 3, value: 3, key: 'options.q4.3' },
        { id: 2, value: 2, key: 'options.q4.2' },
        { id: 1, value: 1, key: 'options.q4.1' }
    ],
};
// Funções Auxiliares
const getOrGenerateUUID = () => {
    let userUuid = localStorage.getItem('user_uuid');
    if (!userUuid) {
        userUuid = (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3f | 0x80);
                return v.toString(16);
            });
        localStorage.setItem('user_uuid', userUuid);
    }
    return userUuid;
};

// --- COMPONENTE PRINCIPAL ---
const CompleteTestQualityForm = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedTests, setSelectedTests] = useState(null);
    const [allFormData, setAllFormData] = useState({});
    const [completedSteps, setCompletedSteps] = useState({});
    const [isCurrentStepComplete, setIsCurrentStepComplete] = useState(false);

    // Estado de experiência em Java e estado de envio final
    const [javaExperience, setJavaExperience] = useState(() => {
        return localStorage.getItem('user_java_experience') || null;
    });
    const [isSubmitted, setIsSubmitted] = useState(() => {
        return localStorage.getItem('form_submitted') === 'true';
    });
    const [userUuid] = useState(getOrGenerateUUID);

    // Carregar TODOS os modelos para cada classe SUT (Alteração 2)
    useEffect(() => {
        const tests = {};
        const allModelNames = Object.keys(TEST_CODE_UNIVERSE);

        SUT_CLASSES.forEach(sut => {
            tests[sut] = allModelNames.map(modelName => ({
                modelName: modelName,
                code: TEST_CODE_UNIVERSE[modelName]?.[sut] || "// código não encontrado"
            }));
        });
        setSelectedTests(tests);
    }, []);

    // Restaurar formulário do LocalStorage se existir
    useEffect(() => {
        const savedData = localStorage.getItem('user_form_data');
        if (savedData) {
            try {
                setAllFormData(JSON.parse(savedData));
            } catch (e) {
                console.error("Erro ao carregar dados do localStorage", e);
            }
        }
    }, []);

    // Salvar progresso do formulário no LocalStorage (Alteração 5)
    useEffect(() => {
        if (Object.keys(allFormData).length > 0) {
            localStorage.setItem('user_form_data', JSON.stringify(allFormData));
        }
    }, [allFormData]);

    useEffect(() => {
        form.setFieldsValue(allFormData);
    }, [currentStep, form]);

    const currentSut = SUT_CLASSES[currentStep];
    const currentCode = SUT_CODES[currentSut];
    const testsForCurrentSut = selectedTests ? selectedTests[currentSut] : [];

    // --- FUNÇÃO DE MENSAGEM DE ERRO DETALHADA POR ETAPA ---
    const getMissingQuestionsMessage = (stepIndex) => {
        const sut = SUT_CLASSES[stepIndex];
        const tests = selectedTests ? selectedTests[sut] : [];
        const sutValues = allFormData[sut] || {};
        const missingMap = {};

        tests.forEach((test, testIndex) => {
            const testNum = testIndex + 1;
            const testValues = sutValues[test.modelName] || {};
            QUESTIONS.forEach((q) => {
                if (testValues[q.id] === undefined || testValues[q.id] === null) {
                    if (!missingMap[testNum]) missingMap[testNum] = [];
                    missingMap[testNum].push(q.id.toUpperCase());
                }
            });
        });

        const testKeys = Object.keys(missingMap);
        if (testKeys.length === 0) return null;

        return testKeys
            .map(tNum => t('form.missingItem', { test: tNum, questions: missingMap[tNum].join(', ') }))
            .join(' | ');
    };

    // Validação automática e progresso
    useEffect(() => {
        if (!selectedTests || javaExperience === null) return;
        const missing = getMissingQuestionsMessage(currentStep);

        if (!missing && !completedSteps[currentStep]) {
            setCompletedSteps(prev => ({ ...prev, [currentStep]: true }));
        }
    }, [allFormData, currentStep, selectedTests, completedSteps, javaExperience]);

    const handleExperienceSubmit = ({ years }) => {
        setJavaExperience(years);
        localStorage.setItem('user_java_experience', years.toString());
    };

    const handleNext = () => {
        const missingText = getMissingQuestionsMessage(currentStep);
        if (missingText) {
            message.error(t('messages.fillAllTabFields', { missing: missingText }));
            return;
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setCurrentStep(currentStep + 1);
    };

    const handleStepChange = (nextStep) => {
        if (nextStep !== currentStep) {
            const missingText = getMissingQuestionsMessage(currentStep);
            if (missingText) {
                message.error(t('messages.fillAllTabFields', { missing: missingText }));
                return;
            }
        }
        setCurrentStep(nextStep);
    };

    const onFinish = async () => {
        const missingText = getMissingQuestionsMessage(currentStep);
        if (missingText) {
            message.error(t('messages.fillAllBeforeSubmit', { missing: missingText }));
            return;
        }

        try {
            const payload = flatten(allFormData, javaExperience, userUuid);

            await fetch("https://script.google.com/macros/s/AKfycbzhL-o20leFW5N9EF4fSQh0AVjw9h08Nt4Z_kITY7-5U6PGtemKzZ6p0XMnRX63wMSc5A/exec", {
                method: "POST",
                mode: "no-cors",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            localStorage.setItem('form_submitted', 'true');
            setIsSubmitted(true);
            message.success(t('messages.successSubmit'));
        } catch (error) {
            console.error('ERRO no fetch:', error);
            message.error(t('messages.errorSubmit'));
        }
    };

    const handlePrev = () => setCurrentStep(currentStep - 1);


    // Achatar respostas junto com a experiência Java e UUID (Alterações 4 e 6)
    function flatten(obj, exp, uuid) {
        const rows = [];
        for (const metodo of Object.keys(obj)) {
            const models = obj[metodo];
            for (const [modelo, scores] of Object.entries(models)) {
                rows.push({
                    uuid: uuid,
                    javaExperienceYears: exp,
                    modelo,
                    metodo,
                    q1: scores.q1 ?? null,
                    q2: scores.q2 ?? null,
                    q3: scores.q3 ?? null,
                    q4: scores.q4 ?? null,
                });
            }
        }
        return rows;
    }

    // --- TELA FINAL (SUBMETIDO) --- (Alteração 6)
    if (isSubmitted) {
        return (
            <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '50px 20px' }}>
                <Content style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <Card>
                        <Result
                            status="success"
                            title={t('completion.title')}
                            subTitle={t('completion.subtitle')}
                        />
                        <div style={{ textAlign: 'center', marginTop: 20 }}>
                            <Paragraph style={{ fontSize: 16 }}>
                                {t('completion.uuidLabel')}: <Text code strong>{userUuid}</Text>
                            </Paragraph>
                            <Paragraph type="secondary" style={{ marginTop: 20 }}>
                                {t('completion.removalNotice')} <Text copyable={{ text: 'esdras.caleb@ufrn.br' }}>esdras.caleb@ufrn.br</Text>.
                            </Paragraph>
                        </div>
                    </Card>
                </Content>
            </Layout>
        );
    }

    // --- TELA INICIAL: PERGUNTA DE EXPERIÊNCIA EM JAVA --- (Alterações 3 e 5)
    if (javaExperience === null) {
        return (
            <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '50px 20px' }}>
                <Content style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <Card style={{ textAlign: "center" }}>
                        <Title level={3}>{t('experience.title')}</Title>
                        <Paragraph type="secondary">{t('experience.subtitle')}</Paragraph>
                        <Form
                            onFinish={handleExperienceSubmit}
                            layout="vertical"
                            style={{ marginTop: 30 }}
                        >
                            <Form.Item
                                name="years"
                                label={t('experience.inputLabel')}
                                rules={[{ required: true, message: t('experience.requiredError') }]}
                            >
                                <InputNumber
                                    min={0}
                                    max={60}
                                    style={{ width: '100%' }}
                                    placeholder={t('experience.inputPlaceholder')}
                                />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" size="large" block>
                                    {t('experience.submitBtn')}
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Content>
            </Layout>
        );
    }

    if (!selectedTests) {
        return (
            <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spin size="large" />
            </Layout>
        );
    }

    const getStepStatus = (stepIndex) => {
        if (completedSteps[stepIndex]) return 'finish';
        return stepIndex === currentStep ? 'process' : 'wait';
    };

    const globalStyles = `
      .ant-steps-item-title {
        width: 200px;
        white-space: normal;
        line-height: 1.2;
      }
    `;
    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            <Content style={{ padding: '50px 20px', maxWidth: '1000px', margin: '0 auto' }}>
                <Card>
                    <Steps current={currentStep} onChange={handleStepChange} style={{ marginBottom: '40px' }}>
                        {SUT_CLASSES.map((item, index) => (
                            <Step key={item} title={item} status={getStepStatus(index)} />
                        ))}
                    </Steps>

                    <Title level={3}>{t('form.evaluatingClass')}: <Text type="success">{currentSut}</Text></Title>
                    <Card title={t('form.sutCodeTitle')} size="small" style={{ marginBottom: 24, backgroundColor: '#f9f9f9' }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                            {`\`\`\`java\n${currentCode}\n\`\`\``}
                        </ReactMarkdown>
                    </Card>

                    <Title level={4} type="secondary">
                        {t('form.evaluateTestsNotice', { count: testsForCurrentSut.length })}
                    </Title>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        initialValues={allFormData}
                        onValuesChange={(changedValues, allValues) => setAllFormData({ ...allFormData, ...allValues })}
                    >
                        {testsForCurrentSut?.map((test, testIndex) => (
                            <div key={`${currentSut}-${test.modelName}`}>
                                <Card
                                    title={`${t('form.testCardTitle')} ${testIndex + 1}`}
                                    style={{ marginBottom: 24 }}
                                >
                                    <Card title={t('form.testCodeTitle')} size="small" style={{ marginBottom: 24, backgroundColor: '#f9f9f9' }}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                                            {`\`\`\`java\n${test.code}\n\`\`\``}
                                        </ReactMarkdown>
                                    </Card>
                                    {QUESTIONS.map((question) => (
                                        <Form.Item
                                            key={question.id}
                                            name={[currentSut, test.modelName, question.id]}
                                            label={t(question.key)}
                                        >
                                            <Radio.Group>
                                                <Space direction="vertical">
                                                    {ANSWER_OPTIONS[question.id].map(option => (
                                                        <Radio key={option.id} value={option.value}>
                                                            {t(option.key)}
                                                        </Radio>
                                                    ))}
                                                </Space>
                                            </Radio.Group>
                                        </Form.Item>
                                    ))}
                                </Card>
                            </div>
                        ))}
                        {/* RELATÓRIO DE PENDÊNCIAS DA ABA CORRENTE */}
                        {getMissingQuestionsMessage(currentStep) && (
                            <div style={{
                                marginBottom: '16px',
                                padding: '12px 16px',
                                backgroundColor: '#fff2f0',
                                border: '1px solid #ffccc7',
                                borderRadius: '6px',
                                color: '#ff4d4f',
                                fontWeight: '500'
                            }}>
                                ⚠️ <strong>{t('form.pendingInTab')}:</strong> {getMissingQuestionsMessage(currentStep)}
                            </div>
                        )}
                        <div style={{ marginTop: '24px', textAlign: 'right' }}>
                            <Space>
                                {currentStep > 0 && (
                                    <Button onClick={handlePrev}>
                                        {t('btn.prev', 'Anterior')}
                                    </Button>
                                )}

                                {currentStep < SUT_CLASSES.length - 1 && (
                                    <Button type="primary" onClick={handleNext}>
                                        {t('btn.next', 'Próximo')}
                                    </Button>
                                )}

                                {currentStep === SUT_CLASSES.length - 1 && (
                                    <Button type="primary" htmlType="submit">
                                        {t('btn.submit', 'Enviar')}
                                    </Button>
                                )}
                            </Space>
                        </div>
                    </Form>
                </Card>
            </Content>
        </Layout>
    );
};

export default CompleteTestQualityForm;