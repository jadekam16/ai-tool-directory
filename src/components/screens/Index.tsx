import React from 'react'
import { Dialog } from '@headlessui/react';
import { collection, getDocs, query, addDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { useAuthState } from '~/components/contexts/UserContext';
import { SignInButton } from '~/components/domain/auth/SignInButton';
import { SignOutButton } from '~/components/domain/auth/SignOutButton';
import { Head } from '~/components/shared/Head';
import { useFirestore } from '~/lib/firebase';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PencilSquareIcon } from '@heroicons/react/24/outline'

/* The types we defined in the database :) */
type Tool = {
  id: string,
  title: string,
  description: string,
  url: string
}

/* Good for when there are only a few types something can be */
enum InputEnum {
  Id = 'id',
  Title = 'title',
  Description = 'description',
  Url = 'url'
}

function Index () {
  const { state } = useAuthState();
  /*  useState<Array<Tool>> shows that it is an array of Type Tool */
  const [ tools, setTools ] = useState<Array<Partial<Tool>>>( [] );
  const firestore = useFirestore();
  /* Partial is a good tool to know, i.e.., when users are typing,
  some of the fields may be empty */
  const [ inputData, setInputData ] = useState<Partial<Tool>>( {
    title: '',
    description: '',
    url: ''
  } );
  const [ formError, setFormError ] = useState<boolean>( false )

  useEffect( () => {
    async function fetchData () {
      /* get collection from firestore database */
      const toolsCollection = collection( firestore, "tools" );
      const toolsQuery = query( toolsCollection );
      /* getDocs = get me all the docs fom inside this collection */
      const querySnapshot = await getDocs( toolsQuery );
      const fetchedData: Array<Tool> = [];
      querySnapshot.forEach( ( doc ) => {
        fetchedData.push( { id: doc.id, ...doc.data() } as Tool )
      } )
      setTools( fetchedData );
    }
    fetchData();
  }, [] );

  const handleInputChange = ( field: InputEnum, value: string ) => {
    setInputData( { ...inputData, [ field ]: value } )
  }

  const handleFormSubmit = async ( e: React.FormEvent<HTMLFormElement> ) => {
    e.preventDefault()
    try {
      const toolsCollection = collection( firestore, "tools" );
      const newTool: Partial<Tool> = {
        title: inputData.title,
        description: inputData.description,
        url: inputData.url
      }
      await addDoc( toolsCollection, newTool );
      toast.success( '🦄 Saved the tool successfully!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      } );

      setTools( [ ...tools, newTool ] );
      setInputData( {
        title: '',
        description: '',
        url: ''
      } )
    } catch ( error ) {
      setFormError( true );
    }
  }

  return (
    <>
      <Head title="TOP PAGE" />
      {/* min-h-screen means it'll expand at fullscreen */}
      <div className="hero min-h-screen bg-slate-800">
        <div className="max-w-5xl mx-auto">
          <form className='flex' onSubmit={handleFormSubmit}>
            <input type='text' onChange={( e ) => handleInputChange( InputEnum.Title, e.target.value )} value={inputData.title} placeholder='title' className='m-4 text-slate-50 bg-transparent border border-slate-700 focus:ring-slate-400 focus:outline-none p-4 rounded-lg' />
            <input type='text' onChange={( e ) => handleInputChange( InputEnum.Description, e.target.value )} value={inputData.description} placeholder='description' className='m-4 text-slate-50 bg-transparent border border-slate-700 focus:ring-slate-400 focus:outline-none p-4 rounded-lg' />
            <input type='text' onChange={( e ) => handleInputChange( InputEnum.Url, e.target.value )} value={inputData.url} placeholder='url' className='m-4 text-slate-50 bg-transparent border border-slate-700 focus:ring-slate-400 focus:outline-none p-4 rounded-lg' />
            <button type='submit' className='m-4 border border-purple-500 p-5 rounded-lg transition-opacity bg-purple-600 bg-opacity-30 hover:bg-opacity-50 text-slate-50'>Add new tool</button>
          </form>
          <div className="grid grid-cols-3 gap-4 w-full bg-transparent text-slate-50">
            {
              tools.map( ( tool ) => (
                <div key={tool.id} className='h-48 rounded-md flex flex-col justify-between shadow-slate-900 shadow-md p-4 bg-gradient-to-r from-slate-800 to-slate-700'>
                  <div>
                    <div className='text-xl mb-2 font-bold'>{tool.title}</div>
                    <div className=''>{tool.description}</div>
                  </div>
                  <a className='text-slate-400' href={tool.url}>{tool.url}</a>
                </div>
              ) )
            }
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default Index;