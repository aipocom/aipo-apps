package com.aimluck.model;

import java.io.Serializable;
import java.util.Date;

import com.google.appengine.api.datastore.Key;

import org.slim3.datastore.Attribute;
import org.slim3.datastore.Model;
import org.slim3.datastore.ModelRef;

@Model(kind = "ShCDel", schemaVersion = 1, schemaVersionName = "sV")
public class SheetColumnDelete implements Serializable {

	private static final long serialVersionUID = 1L;

	@Attribute(primaryKey = true, name = "k")
	private Key key;
	@Attribute(version = true, name = "v")
	private Long version;
	@Attribute(name = "ShCR")
	private ModelRef<SheetColumn> sheetColumnRef = new ModelRef<SheetColumn>(
			SheetColumn.class);
	@Attribute(name = "kN")
	private String kindName;
	@Attribute(name = "cN")
	private String columnName;
	@Attribute(name = "cur")
	private String cursor;
	@Attribute(name = "cA")
	private Date createdAt;

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
	 *            the key
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
	 *            the version
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
		SheetColumnDelete other = (SheetColumnDelete) obj;
		if (key == null) {
			if (other.key != null) {
				return false;
			}
		} else if (!key.equals(other.key)) {
			return false;
		}
		return true;
	}

	public ModelRef<SheetColumn> getSheetColumnRef() {
		return sheetColumnRef;
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

	public String getCursor() {
		return cursor;
	}

	public void setCursor(String cursor) {
		this.cursor = cursor;
	}

	public void setCreatedAt(Date createdAt) {
		this.createdAt = createdAt;
	}

	public Date getCreatedAt() {
		return createdAt;
	}
}
