'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

import { BookUser, Building2, CalendarDays, Check, ChevronsUpDown, DollarSign, FlaskConical, Globe, GraduationCap, HeadphonesIcon,Phone, Users } from 'lucide-react'

import universityTopics from '@/lib/config/university-topics.json'
import { getCookie, setCookie } from '@/lib/utils/cookies'

import { useIsMobile } from '@/hooks/use-mobile'

import { Button } from './ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from './ui/command'
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from './ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

interface Topic {
    id: string;
    name: string;
    urls: string[];
}

const topicIcons: { [key: string]: React.ElementType } = {
  general: Globe,
  admissions: GraduationCap,
  programs: BookUser,
  international: Users,
  'fees-scholarships': DollarSign,
  'student-life': Users,
  academic: CalendarDays,
  faculties: Building2,
  research: FlaskConical,
  contact: HeadphonesIcon
};

export function TopicSelector() {
  const [open, setOpen] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const isMobile = useIsMobile()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTopicId = getCookie('selectedTopic')
    if (savedTopicId) {
      const topic = universityTopics.topics.find(t => t.id === savedTopicId)
      setSelectedTopic(topic || null)
    }
  }, [])

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic)
    setCookie('selectedTopic', topic.id)
    setOpen(false)
  }

  const TopicIcon = selectedTopic ? topicIcons[selectedTopic.id] : Globe;

  // Prevent hydration mismatch by rendering desktop version on server
  if (!mounted) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            role="combobox"
            aria-expanded={open}
            aria-label={selectedTopic ? selectedTopic.name : 'Choose search topic'}
            className="size-8 rounded-full hover:bg-accent/50 transition-colors"
          >
            <TopicIcon className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search topics..." />
            <CommandList>
              <CommandEmpty>No topic found.</CommandEmpty>
              <CommandGroup>
                {universityTopics.topics.map(topic => {
                  const Icon = topicIcons[topic.id];
                  return (
                    <CommandItem
                      key={topic.id}
                      value={topic.name}
                      onSelect={() => handleTopicSelect(topic as Topic)}
                      className="flex justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="size-4" />
                        <span className="text-xs font-medium">
                          {topic.name}
                        </span>
                      </div>
                      <Check
                        className={`h-4 w-4 ${
                          selectedTopic?.id === topic.id ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={selectedTopic ? selectedTopic.name : 'Choose search topic'}
            className="size-8 rounded-full hover:bg-accent/50 transition-colors"
          >
            <TopicIcon className="size-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[60vh]">
          <div className="flex flex-col">
            <DrawerTitle className="text-lg font-medium text-center pt-4 pb-2 px-4">Choose a Topic</DrawerTitle>
            <div className="flex flex-col gap-2 p-4 pt-2 overflow-y-auto max-h-[calc(60vh-4rem)]">
              {universityTopics.topics.map(topic => {
                const Icon = topicIcons[topic.id];
                return (
                  <Button
                    key={topic.id}
                    variant="outline"
                    className="w-full justify-between h-14 flex-shrink-0"
                    onClick={() => handleTopicSelect(topic as Topic)}
                  >
                    <div className="flex items-center gap-3">
                        <Icon className="size-5" />
                        <span className="font-medium">{topic.name}</span>
                    </div>
                    {selectedTopic?.id === topic.id && <Check className="h-4 w-4" />}
                  </Button>
                )
              })}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button
            variant="ghost"
            size="icon"
            role="combobox"
            aria-expanded={open}
            aria-label={selectedTopic ? selectedTopic.name : 'Choose search topic'}
            className="size-8 rounded-full hover:bg-accent/50 transition-colors"
            >
                <TopicIcon className="size-4" />
            </Button>
        </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search topics..." />
          <CommandList>
            <CommandEmpty>No topic found.</CommandEmpty>
            <CommandGroup>
              {universityTopics.topics.map(topic => {
                const Icon = topicIcons[topic.id];
                return (
                    <CommandItem
                        key={topic.id}
                        value={topic.name}
                        onSelect={() => handleTopicSelect(topic as Topic)}
                        className="flex justify-between"
                    >
                        <div className="flex items-center space-x-2">
                        <Icon className="size-4" />
                        <span className="text-xs font-medium">
                            {topic.name}
                        </span>
                        </div>
                        <Check
                        className={`h-4 w-4 ${
                            selectedTopic?.id === topic.id ? 'opacity-100' : 'opacity-0'
                        }`}
                        />
                    </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}