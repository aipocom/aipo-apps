package getexcelfunctions.meta;

//@javax.annotation.Generated(value = { "slim3-gen", "@VERSION@" }, date = "2011-07-19 17:08:34")
/** */
public final class ExcelFunctionsMeta extends org.slim3.datastore.ModelMeta<getexcelfunctions.model.ExcelFunctions> {

    /** */
    public final org.slim3.datastore.StringAttributeMeta<getexcelfunctions.model.ExcelFunctions> categories = new org.slim3.datastore.StringAttributeMeta<getexcelfunctions.model.ExcelFunctions>(this, "categories", "categories");

    /** */
    public final org.slim3.datastore.StringAttributeMeta<getexcelfunctions.model.ExcelFunctions> comments = new org.slim3.datastore.StringAttributeMeta<getexcelfunctions.model.ExcelFunctions>(this, "comments", "comments");

    /** */
    public final org.slim3.datastore.StringAttributeMeta<getexcelfunctions.model.ExcelFunctions> form = new org.slim3.datastore.StringAttributeMeta<getexcelfunctions.model.ExcelFunctions>(this, "form", "form");

    /** */
    public final org.slim3.datastore.StringAttributeMeta<getexcelfunctions.model.ExcelFunctions> function = new org.slim3.datastore.StringAttributeMeta<getexcelfunctions.model.ExcelFunctions>(this, "function", "function");

    /** */
    public final org.slim3.datastore.CoreAttributeMeta<getexcelfunctions.model.ExcelFunctions, com.google.appengine.api.datastore.Key> key = new org.slim3.datastore.CoreAttributeMeta<getexcelfunctions.model.ExcelFunctions, com.google.appengine.api.datastore.Key>(this, "__key__", "key", com.google.appengine.api.datastore.Key.class);

    /** */
    public final org.slim3.datastore.CoreAttributeMeta<getexcelfunctions.model.ExcelFunctions, java.lang.Long> version = new org.slim3.datastore.CoreAttributeMeta<getexcelfunctions.model.ExcelFunctions, java.lang.Long>(this, "version", "version", java.lang.Long.class);

    private static final ExcelFunctionsMeta slim3_singleton = new ExcelFunctionsMeta();

    /**
     * @return the singleton
     */
    public static ExcelFunctionsMeta get() {
       return slim3_singleton;
    }

    /** */
    public ExcelFunctionsMeta() {
        super("ExcelFunctions", getexcelfunctions.model.ExcelFunctions.class);
    }

    @Override
    public getexcelfunctions.model.ExcelFunctions entityToModel(com.google.appengine.api.datastore.Entity entity) {
        getexcelfunctions.model.ExcelFunctions model = new getexcelfunctions.model.ExcelFunctions();
        model.setCategories((java.lang.String) entity.getProperty("categories"));
        model.setComments((java.lang.String) entity.getProperty("comments"));
        model.setForm((java.lang.String) entity.getProperty("form"));
        model.setFunction((java.lang.String) entity.getProperty("function"));
        model.setKey(entity.getKey());
        model.setVersion((java.lang.Long) entity.getProperty("version"));
        return model;
    }

    @Override
    public com.google.appengine.api.datastore.Entity modelToEntity(java.lang.Object model) {
        getexcelfunctions.model.ExcelFunctions m = (getexcelfunctions.model.ExcelFunctions) model;
        com.google.appengine.api.datastore.Entity entity = null;
        if (m.getKey() != null) {
            entity = new com.google.appengine.api.datastore.Entity(m.getKey());
        } else {
            entity = new com.google.appengine.api.datastore.Entity(kind);
        }
        entity.setProperty("categories", m.getCategories());
        entity.setProperty("comments", m.getComments());
        entity.setProperty("form", m.getForm());
        entity.setProperty("function", m.getFunction());
        entity.setProperty("version", m.getVersion());
        entity.setProperty("slim3.schemaVersion", 1);
        return entity;
    }

    @Override
    protected com.google.appengine.api.datastore.Key getKey(Object model) {
        getexcelfunctions.model.ExcelFunctions m = (getexcelfunctions.model.ExcelFunctions) model;
        return m.getKey();
    }

    @Override
    protected void setKey(Object model, com.google.appengine.api.datastore.Key key) {
        validateKey(key);
        getexcelfunctions.model.ExcelFunctions m = (getexcelfunctions.model.ExcelFunctions) model;
        m.setKey(key);
    }

    @Override
    protected long getVersion(Object model) {
        getexcelfunctions.model.ExcelFunctions m = (getexcelfunctions.model.ExcelFunctions) model;
        return m.getVersion() != null ? m.getVersion().longValue() : 0L;
    }

    @Override
    protected void assignKeyToModelRefIfNecessary(com.google.appengine.api.datastore.AsyncDatastoreService ds, java.lang.Object model) {
    }

    @Override
    protected void incrementVersion(Object model) {
        getexcelfunctions.model.ExcelFunctions m = (getexcelfunctions.model.ExcelFunctions) model;
        long version = m.getVersion() != null ? m.getVersion().longValue() : 0L;
        m.setVersion(Long.valueOf(version + 1L));
    }

    @Override
    protected void prePut(Object model) {
    }

    @Override
    public String getSchemaVersionName() {
        return "slim3.schemaVersion";
    }

    @Override
    public String getClassHierarchyListName() {
        return "slim3.classHierarchyList";
    }

    @Override
    protected boolean isCipherProperty(String propertyName) {
        return false;
    }

    @Override
    protected void modelToJson(org.slim3.datastore.json.JsonWriter writer, java.lang.Object model, int maxDepth, int currentDepth) {
        getexcelfunctions.model.ExcelFunctions m = (getexcelfunctions.model.ExcelFunctions) model;
        writer.beginObject();
        org.slim3.datastore.json.Default encoder0 = new org.slim3.datastore.json.Default();
        if(m.getCategories() != null){
            writer.setNextPropertyName("categories");
            encoder0.encode(writer, m.getCategories());
        }
        if(m.getComments() != null){
            writer.setNextPropertyName("comments");
            encoder0.encode(writer, m.getComments());
        }
        if(m.getForm() != null){
            writer.setNextPropertyName("form");
            encoder0.encode(writer, m.getForm());
        }
        if(m.getFunction() != null){
            writer.setNextPropertyName("function");
            encoder0.encode(writer, m.getFunction());
        }
        if(m.getKey() != null){
            writer.setNextPropertyName("key");
            encoder0.encode(writer, m.getKey());
        }
        if(m.getVersion() != null){
            writer.setNextPropertyName("version");
            encoder0.encode(writer, m.getVersion());
        }
        writer.endObject();
    }

    @Override
    protected getexcelfunctions.model.ExcelFunctions jsonToModel(org.slim3.datastore.json.JsonRootReader rootReader, int maxDepth, int currentDepth) {
        getexcelfunctions.model.ExcelFunctions m = new getexcelfunctions.model.ExcelFunctions();
        org.slim3.datastore.json.JsonReader reader = null;
        org.slim3.datastore.json.Default decoder0 = new org.slim3.datastore.json.Default();
        reader = rootReader.newObjectReader("categories");
        m.setCategories(decoder0.decode(reader, m.getCategories()));
        reader = rootReader.newObjectReader("comments");
        m.setComments(decoder0.decode(reader, m.getComments()));
        reader = rootReader.newObjectReader("form");
        m.setForm(decoder0.decode(reader, m.getForm()));
        reader = rootReader.newObjectReader("function");
        m.setFunction(decoder0.decode(reader, m.getFunction()));
        reader = rootReader.newObjectReader("key");
        m.setKey(decoder0.decode(reader, m.getKey()));
        reader = rootReader.newObjectReader("version");
        m.setVersion(decoder0.decode(reader, m.getVersion()));
        return m;
    }
}