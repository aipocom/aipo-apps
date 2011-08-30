package com.aimluck.model;

import java.io.Serializable;
import java.util.List;

import com.google.appengine.api.datastore.Key;

import org.slim3.datastore.Attribute;
import org.slim3.datastore.Model;
import org.slim3.datastore.ModelRef;

@Model(kind = "ShC", schemaVersion = 1, schemaVersionName = "sV")
public class SheetColumn implements Serializable {

  private static final long serialVersionUID = 1L;

  @Attribute(primaryKey = true, name = "k")
  private Key key;
  @Attribute(version = true, name = "v")
  private Long version;
  @Attribute(name = "n")
  private String name;
  @Attribute(name = "c")
  private String comment;
  @Attribute(name = "i")
  private int index;
  @Attribute(name = "seq")
  private int sequence;
  @Attribute(name = "kN")
  private String kindName;
  @Attribute(name = "cN")
  private String columnName;
  @Attribute(name = "dT")
  private String dataType;
  @Attribute(name = "sVals", unindexed=true)
  private List<String> selectValues;
  @Attribute(name = "dV")
  private String defaultValue;
  @Attribute(name = "iL")
  private boolean list;
  @Attribute(name = "iR")
  private boolean required;
  @Attribute(name = "ShR")
  private ModelRef<Sheet> sheetRef = new ModelRef<Sheet>(Sheet.class);

  /**
   * Returns the key.
   * 
   * @return the key
   */
  public Key getKey() {
    return key;
  }

  /**
   * Sets the key.
   * 
   * @param key
   *          the key
   */
  public void setKey(Key key) {
    this.key = key;
  }

  /**
   * Returns the version.
   * 
   * @return the version
   */
  public Long getVersion() {
    return version;
  }

  /**
   * Sets the version.
   * 
   * @param version
   *          the version
   */
  public void setVersion(Long version) {
    this.version = version;
  }

  @Override
  public int hashCode() {
    final int prime = 31;
    int result = 1;
    result = prime * result + ((key == null) ? 0 : key.hashCode());
    return result;
  }

  @Override
  public boolean equals(Object obj) {
    if (this == obj) {
      return true;
    }
    if (obj == null) {
      return false;
    }
    if (getClass() != obj.getClass()) {
      return false;
    }
    SheetColumn other = (SheetColumn) obj;
    if (key == null) {
      if (other.key != null) {
        return false;
      }
    } else if (!key.equals(other.key)) {
      return false;
    }
    return true;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getName() {
    return name;
  }

  public void setComment(String comment) {
    this.comment = comment;
  }

  public String getComment() {
    return comment;
  }

  public void setIndex(int index) {
    this.index = index;
  }

  public int getIndex() {
    return index;
  }

  public void setKindName(String kindName) {
    this.kindName = kindName;
  }
  public String getKindName() {
    return kindName;
  }

  public void setColumnName(String columnName) {
    this.columnName = columnName;
  }

  public String getColumnName() {
    return columnName;
  }

  public void setDataType(String dataType) {
    this.dataType = dataType;
  }

  public String getDataType() {
    return dataType;
  }
  
  public void setSelectValues(List<String> selectValues) {
    this.selectValues = selectValues;
  }

  public List<String> getSelectValues() {
    return selectValues;
  }

  public ModelRef<Sheet> getSheetRef() {
    return sheetRef;
  }

  public void setDefaultValue(String defaultValue) {
    this.defaultValue = defaultValue;
  }

  public String getDefaultValue() {
    return defaultValue;
  }

  public void setList(boolean list) {
    this.list = list;
  }

  public boolean isList() {
    return list;
  }

  public void setSequence(int sequence) {
    this.sequence = sequence;
  }

  public int getSequence() {
    return sequence;
  }

  public void setRequired(boolean required) {
    this.required = required;
  }

  public boolean isRequired() {
    return required;
  }
}
