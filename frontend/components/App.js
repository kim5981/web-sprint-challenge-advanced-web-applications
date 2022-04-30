import React, { useState } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import axios from "axios"

import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'
import axiosWithAuth from '../axios'


const articlesUrl = 'http://localhost:9000/api/articles'
const loginUrl = 'http://localhost:9000/api/login'



export default function App() {
  // ✨ MVP can be achieved with these states
  const [message, setMessage] = useState('')
  const [articles, setArticles] = useState([])
  const [currentArticleId, setCurrentArticleId] = useState(null)
  const [spinnerOn, setSpinnerOn] = useState(false)

  const navigate = useNavigate()

  const redirectToLogin = () => navigate("/") 
  const redirectToArticles = () => navigate("/articles") 


  const logout = () => {
    window.localStorage.removeItem("token") 
    setMessage("Goodbye!")
    redirectToLogin()
  }

  const login = ({ username, password }) => {
    setSpinnerOn(true)
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch a request to the proper endpoint.
    // On success, we should set the token to local storage in a 'token' key,
    // put the server success message in its proper state, and redirect
    // to the Articles screen. Don't forget to turn off the spinner!
    axios.post(loginUrl, { username, password })
    .then( res => {
      const token = res.data.token
      window.localStorage.setItem("token", token)
      setMessage(res.data.message)
      navigate("/articles")
    })
    .catch(err => {
      console.log(err)
      redirectToLogin()
    })
    .finally(() => {
      setSpinnerOn(false)
    })
  }

  const getArticles = () => {

    setSpinnerOn(true)
    axiosWithAuth().get(articlesUrl)
    .then(res=> {
      setMessage(res.data.message)
      setArticles(res.data.articles)
    })
    .catch(err => {
      err.resp.status === 401 ? 
      redirectToLogin()
      : setMessage(err.res.data.message)
    })
    .finally( () => {
      setSpinnerOn(false)
    })

  }

  // for Create page
  const postArticle = article => {
    
    axiosWithAuth.post(articlesUrl, article)
      .then(res => {
        setArticles([...articles, res.data.article])
        setMessage(res.data.message)
      })
      .catch(err => {
        setMessage(err.response.data.message)
      })
  
  }

  // for edit page
  const editArticle = ({ article_id, article }) => {
    setSpinnerOn(true)
  
    axiosWithAuth()
    .put(`${articlesUrl}/${article_id}`, {
      title: article.title,
      text: article.text,
      topic: article.topic
    })
      .then(res => {
        setArticles(articles.map( art => {
          return art.article_id === article_id ? 
          res.data.article :
          art
        }))
        setMessage(res.data.message)
        setCurrentArticleId(null)
      })
      .catch(err => {
        setMessage(err?.response?.data.message)
        // if err message exists display it
      })
      .finally( () => {
        setSpinnerOn(false)
      })
  }

  const updateArticle = article_id => {
    setCurrentArticleId(article_id)
  }


  const deleteArticle = article_id => {

    setSpinnerOn(true)

    axiosWithAuth()
    .delete(`${articlesUrl}/${article_id}`)
    .then(res => {
      setMessage(res.data.message)
      setArticles(articles.filter( article => {
        return article.article_id !== article_id
      }))
    })
    .catch(err => {
      setMessage(err?.response?.data?.message)
    })
    .finally( () => {
      setSpinnerOn(false)
    })
  }

 
  
  return (
    // ✨ fix the JSX: `Spinner`, `Message`, `LoginForm`, `ArticleForm` and `Articles` expect props ❗
    <React.StrictMode>

      <Spinner on={ spinnerOn }/>

      <Message message={ message }/>

      <button id="logout" onClick={logout}>Logout from app</button>
      
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}> {/* <-- do not change this line */}
        <h1>Advanced Web Applications</h1>

        <nav>
          <NavLink id="loginScreen" to="/">Login</NavLink>
          <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
        </nav>

        <Routes>
          <Route path="/" element={<LoginForm login={ login } />} />
          <Route path="articles" element={
            <>
              <ArticleForm
                postArticle={ postArticle }
                editArticle={ editArticle }
                currentArticleId={ currentArticleId }
                article={ articles.find( article => {
                  article.article_id === currentArticleId
                }) }
              />
              <Articles
                 getArticles={ getArticles }
                 articles={ articles }
                 deleteArticle={ deleteArticle }
                 updateArticle={ updateArticle }
              />
            </>
          } />
        </Routes>
        <footer>Bloom Institute of Technology 2022</footer>
      </div>
    </React.StrictMode>
  )
}
