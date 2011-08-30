package com.aimluck.model;

import java.util.Date;

import org.slim3.datastore.Attribute;
import org.slim3.datastore.Model;

import com.google.appengine.api.datastore.Key;

@Model(kind = "uD", schemaVersion = 1, schemaVersionName = "sV")
public class UserData {

  @Attribute(primaryKey = true, name = "k")
  private Key key;
  @Attribute(version = true, name = "v")
  private Long version;
  @Attribute(name = "uI")
  private String userId;
  @Attribute(name = "n")
  private String name;
  @Attribute(name = "e")
  private String email;
  @Attribute(name = "iA")
  private boolean isAdmin;
  @Attribute(name = "cA")
  private Date createdAt;
  @Attribute(name = "uA")
  private Date updatedAt;

  /**
   * 
   * @return
   */
  public Long getVersion() {
    return version;
  }

  /**
   * 
   * @param version
   */
  public void setVersion(Long version) {
    this.version = version;
  }

  /**
   * 
   * @return Google Account userId
   */
  public String getUserId() {
    return userId;
  }

  /**
   * 
   * @param userId
   */
  public void setUserId(String userId) {
    this.userId = userId;
  }

  /**
   * 
   * @return
   */
  public String getName() {
    return name;
  }

  /**
   * 
   * @param name
   */
  public void setName(String name) {
    this.name = name;
  }

  /**
   * 
   * @return
   */
  public String getEmail() {
    return email;
  }

  /**
   * 
   * @param email
   */
  public void setEmail(String email) {
    this.email = email;
  }

  /**
   * @return the key
   */
  public Key getKey() {
    return key;
  }

  /**
   * @param key
   *          the key to set
   */
  public void setKey(Key key) {
    this.key = key;
  }

  /**
   * 
   * @return
   */
  public boolean isAdmin() {
    return isAdmin;
  }

  /**
   * 
   * @param isAdmin
   */
  public void setAdmin(boolean isAdmin) {
    this.isAdmin = isAdmin;
  }

  /**
   * 
   * @return
   */
  public Date getCreatedAt() {
    return createdAt;
  }

  /**
   * 
   * @param createdAt
   */
  public void setCreatedAt(Date createdAt) {
    this.createdAt = createdAt;
  }

  /**
   * 
   * @return
   */
  public Date getUpdatedAt() {
    return updatedAt;
  }

  /**
   * 
   * @param updatedAt
   */
  public void setUpdatedAt(Date updatedAt) {
    this.updatedAt = updatedAt;
  }
}
