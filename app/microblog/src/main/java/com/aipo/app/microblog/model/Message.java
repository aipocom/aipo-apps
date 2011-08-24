package com.aipo.app.microblog.model;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

import org.slim3.datastore.Attribute;
import org.slim3.datastore.Datastore;
import org.slim3.datastore.Model;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.repackaged.com.google.common.collect.Lists;

@Model(schemaVersion = 1, schemaVersionName = "sV", kind = "Me")
public class Message implements Serializable {

  private static final long serialVersionUID = 1L;

  @Attribute(primaryKey = true, name = "k")
  private Key key;

  @Attribute(version = true, name = "v")
  private Long version;

  @Attribute(name = "vI")
  private String viewerId;

  @Attribute(name = "pI")
  private Long parentId = 0L;

  @Attribute(name = "b")
  private String body;

  @Attribute(name = "cA")
  private Date createdAt;

  @Attribute(name = "uA")
  private Date updatedAt;

  @Attribute(name = "c")
  private List<Long> commentIds = Lists.newArrayList();

  @Attribute(persistent = false)
  private List<Message> comments = Lists.newArrayList();

  public static Key createKey(Long id) {
    return Datastore.createKey(Message.class, -id);
  }

  public static Key createKey(Key parentKey, Long id) {
    return Datastore.createKey(parentKey, Message.class, -id);
  }

  public Long getId() {
    return -key.getId();
  }

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
    Message other = (Message) obj;
    if (key == null) {
      if (other.key != null) {
        return false;
      }
    } else if (!key.equals(other.key)) {
      return false;
    }
    return true;
  }

  /**
   * @return viewerId
   */
  public String getViewerId() {
    return viewerId;
  }

  /**
   * @param viewerId
   *          セットする viewerId
   */
  public void setViewerId(String viewerId) {
    this.viewerId = viewerId;
  }

  /**
   * @return parentId
   */
  public Long getParentId() {
    return parentId;
  }

  /**
   * @param parentId
   *          セットする parentId
   */
  public void setParentId(Long parentId) {
    this.parentId = parentId;
  }

  /**
   * @return body
   */
  public String getBody() {
    return body;
  }

  /**
   * @param body
   *          セットする body
   */
  public void setBody(String body) {
    this.body = body;
  }

  /**
   * @return createdAt
   */
  public Date getCreatedAt() {
    return createdAt;
  }

  /**
   * @param createdAt
   *          セットする createdAt
   */
  public void setCreatedAt(Date createdAt) {
    this.createdAt = createdAt;
  }

  /**
   * @return updatedAt
   */
  public Date getUpdatedAt() {
    return updatedAt;
  }

  /**
   * @param updatedAt
   *          セットする updatedAt
   */
  public void setUpdatedAt(Date updatedAt) {
    this.updatedAt = updatedAt;
  }

  /**
   * @return comments
   */
  public List<Long> getCommentIds() {
    return commentIds;
  }

  /**
   * @param comments
   *          セットする comments
   */
  public void setCommentIds(List<Long> commentIds) {
    this.commentIds = commentIds;
  }

  /**
   * @return comments
   */
  public List<Message> getComments() {
    return comments;
  }

  /**
   * @param comments
   *          セットする comments
   */
  public void setComments(List<Message> comments) {
    this.comments = comments;
  }

  public void addComment(Message comment) {
    this.comments.add(comment);
  }

  public void addComment(Long comment) {
    this.commentIds.add(comment);
  }

  public void removeComment(Long comment) {
    this.commentIds.remove(comment);
  }
}
