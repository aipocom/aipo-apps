package searchexcelfunctions.controller.admin;

import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;
import org.slim3.controller.validator.Validators;
import org.slim3.util.RequestMap;

import searchexcelfunctions.service.GefService;

public class RegisterController extends Controller {

    private GefService service = new GefService();

    @Override
    public Navigation run() throws Exception {
        if (!isPost() || !validate()) {
            return redirect(basePath);
        }
        service.register(new RequestMap(request));
        return redirect(basePath);
    }

    private boolean validate() {
        Validators v = new Validators(request);
        v.add("function", v.required("functionが入力されていません。"),v.maxlength(50));
        v.add("comments", v.required("commentsが入力されていません。"),v.maxlength(100, "説明は１００文字以内で入力して下さい。"));
        v.add("form", v.required("formが入力されていません。"),v.maxlength(50));

        return v.validate();
    }
}
