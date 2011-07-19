package getexcelfunctions.controller.csvregister;

import getexcelfunctions.service.GefService;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.URL;
import java.net.URLConnection;
import java.util.StringTokenizer;

import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;

public class IndexController extends Controller {

    private GefService service = new GefService();


    @Override
    public Navigation run() throws Exception {
        try {
            PrintWriter out = response.getWriter();
            URL url = new URL("http://getexcelfunctions.appspot.com/excelfunctionsfile.csv"); //http://localhost:8888/excelfunctionsfile.csv
            URLConnection conn = url.openConnection();
            InputStream in = conn.getInputStream();
            BufferedReader br =
                new BufferedReader(new InputStreamReader(in, "Shift_JIS"));//Shift_JIS
//            BufferedReader br =
//                new BufferedReader(new InputStreamReader(in));//Shift_JIS
            System.setProperty("file.encoding", "UTF-8");
            out.println(System.getProperty("file.encoding"));

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
//                comments = st.nextToken();
//                form = st.nextToken();
                comments = new String(st.nextToken().getBytes("Shift_JIS"), "Shift_JIS");
                form = new String(st.nextToken().getBytes("Shift_JIS"), "Shift_JIS");
//                comments = new String(st.nextToken());
//                form = new String(st.nextToken());
                empty = st.nextToken();

                service.registerParam(categories, comments, form, function);

                out.println(categories
                    + " "
                    + function
                    + " "
                    + comments
                    + " "
                    + form
                    + " "
                    + empty);
            }
            br.close();

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
