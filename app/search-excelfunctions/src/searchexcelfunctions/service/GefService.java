package searchexcelfunctions.service;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.StringTokenizer;

import org.jdom.Element;
import org.jdom.JDOMException;
import org.jdom.Namespace;
import org.jdom.input.SAXBuilder;
import org.slim3.controller.upload.FileItem;
import org.slim3.datastore.Datastore;
import org.slim3.util.BeanUtil;

import searchexcelfunctions.meta.ExcelFunctionsMeta;
import searchexcelfunctions.model.ExcelFunctions;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.Transaction;

public class GefService {
    public ExcelFunctions register(Map<String, Object> input) {
        ExcelFunctions register = new ExcelFunctions();
        BeanUtil.copy(input, register);
        String categories = register.getCategories();
        String comments = register.getComments();
        String form = register.getForm();
        String function = register.getFunction();

        try {
            registerParam(categories, comments, form, function);
        } catch (IOException e) {
            // TODO 自動生成された catch ブロック
            e.printStackTrace();
        } catch (JDOMException e) {
            // TODO 自動生成された catch ブロック
            e.printStackTrace();
        }

        return register;
    }

    public ExcelFunctions registerParam(String categories, String comments,
            String form, String function) throws IOException, JDOMException {
        ExcelFunctions data = new ExcelFunctions();

        Key key = Datastore.createKey(ExcelFunctions.class, function);

        data.setKey(key);
        data.setCategories(categories);
        data.setComments(comments);
        data.setForm(form);
        data.setFunction(function);

        List<String> item = CallAPI(comments);

        data.setComments_parts(item);

        Transaction tx = Datastore.beginTransaction();
        Datastore.put(data);
        tx.commit();
        return data;
    }

    public void deleteFunction(Map<String, Object> input) {
        ExcelFunctions delete = new ExcelFunctions();
        BeanUtil.copy(input, delete);
        String function = delete.getFunction();
        if (function != null) {
            Entity entity = new Entity("ExcelFunctions", function);
            DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
            Key key = ds.put(entity);
            ds.delete(key);
        }
    }

    public ExcelFunctions searchParam(String categories, String comments,
            String form, String function) {
        Key key = Datastore.createKey(ExcelFunctions.class, function);
        ExcelFunctions data = Datastore.get(ExcelFunctions.class, key);
        return data;
    }

    public List<ExcelFunctions> searchParam2(String categories,
            String comments, String form, String function) {
        List<ExcelFunctions> list = new ArrayList<ExcelFunctions>();
        ExcelFunctions data = new ExcelFunctions();

        Key key = Datastore.createKey(ExcelFunctions.class, function);

        data.setKey(key);
        data.setCategories(categories);
        data.setComments(comments);
        data.setForm(form);
        data.setFunction(function);

        Transaction tx = Datastore.beginTransaction();
        Datastore.put(data);
        tx.commit();
        return list;
    }

    public List<ExcelFunctions> upload(FileItem csvfile) throws JDOMException {
        if (csvfile == null) {
            return null;
        }

        try {
            // ファイルの中身を取得
            InputStream is = new ByteArrayInputStream(csvfile.getData());
            BufferedReader br =
                new BufferedReader(new InputStreamReader(is, "Shift_JIS"));

            List<ExcelFunctions> list = new ArrayList<ExcelFunctions>();
            String categories;
            String function;
            String comments;
            String form;

            // 最終行まで読み込む
            String line = "";
            while ((line = br.readLine()) != null) {

                // 1行をデータの要素に分割
                StringTokenizer st = new StringTokenizer(line, ";");

                categories = st.nextToken();
                function = st.nextToken();
                comments = st.nextToken();
                form = st.nextToken();
                st.nextToken();//empty

                registerParam(categories, comments, form, function);
            }
            br.close();

            return list;
        } catch (FileNotFoundException e) {
            // Fileオブジェクト生成時の例外捕捉
            e.printStackTrace();
        } catch (IOException e) {
            // BufferedReaderオブジェクトのクローズ時の例外捕捉
            e.printStackTrace();
        }

        return null;
    }


    //datastoreに格納、3つの値をもてるmap,重複OKなmap or list(?)
    public HashMap<String, String> createHash() throws IOException, JDOMException {
        HashMap<String, String> map = new HashMap<String, String>();
        ExcelFunctionsMeta data = ExcelFunctionsMeta.get();
        List<ExcelFunctions> list = new ArrayList<ExcelFunctions>();
        List<String> item;

        list = Datastore.query(data).sort(data.function.desc).asList();

        for (int j = 0; j < list.size(); j++) {
            item = CallAPI(list.get(j).getComments());
            for (int i = 0; i < item.size(); i++) {
                map.put(item.get(i), list.get(j).getFunction());
            }
        }
        return map;
    }

    public String callURL(URL url) {
        String charset = "UTF-8";
        StringBuilder sb = new StringBuilder();
        try {
            URLConnection uc = url.openConnection();
            BufferedInputStream bis =
                new BufferedInputStream(uc.getInputStream());
            BufferedReader br =
                new BufferedReader(new InputStreamReader(bis, charset));
            String line;
            while ((line = br.readLine()) != null) {
                sb.append(line);
            }
            br.close();
        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return sb.toString();
    }

    public String Morphological(String text)
            throws UnsupportedEncodingException, MalformedURLException {
        String YAHOO_APPID_JA =
            "QZWK7SGxg67FGZpOHgk2rMkwNL5EMOXhnNXqEDKpk32FwzA8PFcgFirTdE6zXJDnKtnp";

        String YAHOO_PARSE_JA =
            "http://jlp.yahooapis.jp/MAService/V1/parse?filter=9&response=surface,reading&appid=" // 「filter=1|3|5|6|7|8|9|10&」を抜いた。
                + YAHOO_APPID_JA
                + "&sentence=";

        String encodeStr = URLEncoder.encode(text, "utf-8");
        URL url = new URL(YAHOO_PARSE_JA + encodeStr);
        String result = callURL(url);

        return result;
    }

     public List<String> CallAPI(String str) throws IOException, JDOMException {
        String appid =
            "QZWK7SGxg67FGZpOHgk2rMkwNL5EMOXhnNXqEDKpk32FwzA8PFcgFirTdE6zXJDnKtnp";
        StringBuilder urlstr =
            new StringBuilder("http://jlp.yahooapis.jp/MAService/V1/parse");
        urlstr.append("?appid=");
        urlstr.append(appid);
        urlstr.append("&filter=9");
        urlstr.append("&sentence=");
        urlstr.append(java.net.URLEncoder.encode(str, "UTF-8"));
        urlstr.append("&results=ma");

        URL url = new URL(urlstr.toString());
        InputStream input = url.openStream();
        BufferedReader reader =
            new BufferedReader(new InputStreamReader(input, "UTF-8"));
        String line;
        StringBuilder xmlres = new StringBuilder();
        while ((line = reader.readLine()) != null) {
            xmlres.append(line);
        }
        reader.close();


        org.jdom.Document doc =
            new SAXBuilder().build(new StringReader(xmlres.toString()));
        Element root = doc.getRootElement();
        Namespace xmls = Namespace.getNamespace("", "urn:yahoo:jp:jlp");
        List<Element> wordList =
            root
                .getChild("ma_result", xmls)
                .getChild("word_list", xmls)
                .getChildren("word", xmls);
        List<String> resString =  new ArrayList<String>();
        for (int i = 0; i < wordList.size(); i++) {
            resString.add(wordList.get(i).getChildText("surface", xmls));
        }
        return resString;
    }

}
