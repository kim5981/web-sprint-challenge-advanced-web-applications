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
    // ✨ implement
    // If a token is in local storage it should be removed,
    // and a message saying "Goodbye!" should be set in its proper state.
    // In any case, we should redirect the browser back to the login screen,
    // using the helper above.
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
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch an authenticated request to the proper endpoint.
    // On success, we should set the articles in their proper state and
    // put the server success message in its proper state.
    // If something goes wrong, check the status of the response:
    // if it's a 401 the token might have gone bad, and we should redirect to login.
    // Don't forget to turn off the spinner!
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

  const postArticle = article => {
    setSpinnerOn(true)

    axiosWithAuth.post(articlesUrl, article)
      .then(res => {
        setArticles([...articles, res.data.article])
      })
      .catch(err => {
        console.log(err)
        setSpinnerOn(false)
        setMessage(err.response.data.message)
      })
      .finally( () => {
        setSpinnerOn(false)
      })
  }

  const editArticle = article => {
    setSpinnerOn(true)
    const { article_id, ...changes } = article
    axiosWithAuth()
    .put(`${articlesUrl}/${article_id}`, changes)
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
    // ✨ implement
  }

  const submit = article => {
    currentArticleId ? editArticle(article) : postArticle(article)
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
                submit={ submit }
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
