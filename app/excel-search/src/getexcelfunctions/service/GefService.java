package getexcelfunctions.service;

import getexcelfunctions.meta.ExcelFunctionsMeta;
import getexcelfunctions.model.ExcelFunctions;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.StringTokenizer;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slim3.controller.upload.FileItem;
import org.slim3.datastore.Datastore;
import org.slim3.util.BeanUtil;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.Transaction;

public class GefService {
    private ExcelFunctionsMeta t = new ExcelFunctionsMeta();

    public ExcelFunctions register(Map<String, Object> input) {
        ExcelFunctions register = new ExcelFunctions();
        BeanUtil.copy(input, register);
        Transaction tx = Datastore.beginTransaction();
        String function = register.getFunction();
        Key key = Datastore.createKey(ExcelFunctions.class, function);
        register.setKey(key);
        Datastore.put(register);
        tx.commit();
        return register;
    }

    public ExcelFunctions urlregister(HttpServletRequest request,
            HttpServletResponse response) throws ServletException, IOException {
        // String categories = request.getParameter("categories");
        // String function = request.getParameter("function");
        // String comments = request.getParameter("comments");
        // String form = request.getParameter("form");
        //
        // PrintWriter out = response.getWriter();
        // out.println("categories="+categories);
        // out.println("function="+function);
        // out.println("comments="+comments);
        // out.println("form="+form);
        return null;
    }

    public ExcelFunctions registerParam(String categories, String comments,
            String form, String function) {
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
        return data;
    }

    public ExcelFunctions searchParam(String categories, String comments,
            String form, String function) {
        Key key = Datastore.createKey(ExcelFunctions.class, function);
        ExcelFunctions data = Datastore.get(ExcelFunctions.class, key);
        return data;
    }

    public List<ExcelFunctions> searchParam2(String categories, String comments,
            String form, String function) {
        List<ExcelFunctions> list = new ArrayList<ExcelFunctions>();
        List<Key> keys;
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



    public List<ExcelFunctions> upload(FileItem csvfile) {
        if(csvfile == null){
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
            String empty;

            // 最終行まで読み込む
            String line = "";
            while ((line = br.readLine()) != null) {

                // 1行をデータの要素に分割
                StringTokenizer st = new StringTokenizer(line, ";");

                categories = st.nextToken();
                function = st.nextToken();
                comments = st.nextToken();
                form = st.nextToken();
                empty = st.nextToken();

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

}
