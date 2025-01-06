"use client"
import { useState } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Modal, Form } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import MarkdownPreview from './MarkdownPreview';


interface Post {
  id: string;
  title: string;
  content: string;
  date: string;
}

// SVGアイコンコンポーネント
const Icons = {
  Edit: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Delete: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  ),
  Drag: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="12" r="1" fill="currentColor" />
      <circle cx="15" cy="12" r="1" fill="currentColor" />
      <circle cx="9" cy="6" r="1" fill="currentColor" />
      <circle cx="15" cy="6" r="1" fill="currentColor" />
      <circle cx="9" cy="18" r="1" fill="currentColor" />
      <circle cx="15" cy="18" r="1" fill="currentColor" />
    </svg>
  )
};

const AdminLayout = () => {
  const [showAdminPanel, setShowAdminPanel] = useState(true);
  const [posts, setPosts] = useState<Post[]>([
    { id: '1', title: "最初の投稿", content: "# 最初の投稿\nこれは最初の投稿です。", date: "2025-01-06" },
    { id: '2', title: "2番目の投稿", content: "# 2番目の投稿\nこれは2番目の投稿です。", date: "2025-01-06" },
  ]);
  const [selectedPost, setSelectedPost] = useState<Post>(posts[0]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  // ドラッグ&ドロップの処理
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(posts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setPosts(items);
  };

  // 編集モーダル
  const EditModal = () => {
    const [editTitle, setEditTitle] = useState(editingPost?.title || '');
    const [editContent, setEditContent] = useState(editingPost?.content || '');
    const [showPreview, setShowPreview] = useState(false);

    const handleSave = () => {
      if (!editingPost) return;

      const updatedPosts = posts.map(post => 
        post.id === editingPost.id ? 
        { ...post, title: editTitle, content: editContent } : 
        post
      );
      setPosts(updatedPosts);
      if (selectedPost.id === editingPost.id) {
        setSelectedPost({ ...selectedPost, title: editTitle, content: editContent });
      }
      setShowEditModal(false);
    };

    return (
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>記事を編集</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>タイトル</Form.Label>
              <Form.Control
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>内容</Form.Label>
              <div className="d-flex justify-content-end mb-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? '編集' : 'プレビュー'}
                </Button>
              </div>
              {showPreview ? (
                <div className="border rounded p-3">
                  <MarkdownPreview content={editContent} />
                </div>
              ) : (
                <Form.Control
                  as="textarea"
                  rows={10}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="font-monospace"
                />
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            キャンセル
          </Button>
          <Button variant="primary" onClick={handleSave}>
            保存
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  // 削除確認モーダル
  const DeleteModal = () => (
    <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>削除の確認</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        本当にこの記事を削除しますか？
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
          キャンセル
        </Button>
        <Button variant="danger" onClick={() => {
          if (!editingPost) return;
          setPosts(posts.filter(post => post.id !== editingPost.id));
          if (selectedPost.id === editingPost.id) {
            setSelectedPost(posts[0]);
          }
          setShowDeleteModal(false);
        }}>
          削除
        </Button>
      </Modal.Footer>
    </Modal>
  );

  const DesktopView = () => (
    <Container style={{ maxWidth: '1024px' }} className="px-0">

      
      <Row className="g-0">

        
        {/* 管理パネル (左側) */}
        {showAdminPanel && (
          <Col md={4} className="border-end vh-100 overflow-auto" style={{ backgroundColor: '#f8f9fa' }}>
            <div className="p-2">
              <div className="d-flex justify-content-between align-items-center mb-3 px-2">
                <h2 className="h5 mb-0">管理パネル</h2>
                <Button 
                  variant="link" 
                  size="sm"
                  className="p-0 text-secondary"
                  onClick={() => setShowAdminPanel(false)}
                >
                  ←
                </Button>
              </div>



      {/* ここに新規作成ボタンを追加 */}
      <div className="mb-3">
        <Button 
          variant="primary" 
          className="w-100"
          onClick={() => {
            const newPost: Post = {
              id: Date.now().toString(),
              title: "新しい記事",
              content: "# 新しい記事\n\n本文を入力してください。",
              date: new Date().toISOString().split('T')[0]
            };
            setPosts([newPost, ...posts]);
            setSelectedPost(newPost);
            setEditingPost(newPost);
            setShowEditModal(true);
          }}
        >
          <div className="d-flex align-items-center justify-content-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            新規作成
          </div>
        </Button>
      </div>



              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="posts">
                  {(provided) => (
                    <ListGroup
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      variant="flush"
                    >
                      {posts.map((post, index) => (
                        <Draggable 
                          key={post.id} 
                          draggableId={post.id} 
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <ListGroup.Item
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`py-2 px-2 ${snapshot.isDragging ? 'bg-light' : ''} ${selectedPost?.id === post.id ? 'bg-light' : ''}`}
                              onClick={() => setSelectedPost(post)}
                              style={{
                                ...provided.draggableProps.style,
                                borderLeft: 'none',
                                borderRight: 'none',
                                borderTop: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              <div className="d-flex align-items-center gap-2">
                                <div className="text-secondary">
                                  <Icons.Drag />
                                </div>
                                <div className="flex-grow-1">
                                  <div className="fw-medium">{post.title}</div>
                                  <small className="text-muted">{post.date}</small>
                                </div>
                                <div className="d-flex gap-1">
                                  <Button 
                                    variant="link" 
                                    size="sm" 
                                    className="p-1 text-secondary"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingPost(post);
                                      setShowEditModal(true);
                                    }}
                                  >
                                    <Icons.Edit />
                                  </Button>
                                  <Button 
                                    variant="link" 
                                    size="sm" 
                                    className="p-1 text-danger"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingPost(post);
                                      setShowDeleteModal(true);
                                    }}
                                  >
                                    <Icons.Delete />
                                  </Button>
                                </div>
                              </div>
                            </ListGroup.Item>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </ListGroup>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </Col>
        )}

        {/* メインコンテンツ (右側) */}
        <Col md={showAdminPanel ? 8 : 12}>
          {!showAdminPanel && (
            <Button
              variant="link"
              className="position-fixed top-0 start-0 m-2 text-secondary"
              onClick={() => setShowAdminPanel(true)}
            >
              →
            </Button>
          )}
          <div className="p-3">
            {selectedPost && (
              <Card className="shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-white">
                  <div>
                    <h2 className="h5 mb-0">{selectedPost.title}</h2>
                    <small className="text-muted">{selectedPost.date}</small>
                  </div>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setIsPreview(!isPreview)}
                  >
                    {isPreview ? 'Markdown' : 'プレビュー'}
                  </Button>
                </Card.Header>
                <Card.Body>
                  {isPreview ? (
                    <MarkdownPreview content={selectedPost.content} />
                  ) : (
                    <pre className="mb-0 font-monospace" style={{ whiteSpace: 'pre-wrap' }}>
                      {selectedPost.content}
                    </pre>
                  )}
                </Card.Body>
              </Card>
            )}
          </div>
        </Col>
      </Row>
      <EditModal />
      <DeleteModal />
    </Container>
  );

  return <DesktopView />;
};

export default AdminLayout;